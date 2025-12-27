import fs from 'fs'
import Database from 'better-sqlite3'
import path from 'path'

const dbPath = path.join(process.cwd(), 'bodegalisten.db')
const db = new Database(dbPath)

// Read the MySQL dump
const mysqlDumpPath = '/Users/toby/Documents/Design-Assets/AI Library/Code/tobiasdo_bodega3.sql'
const content = fs.readFileSync(mysqlDumpPath, 'utf-8')

// Extract INSERT statements for sml_markers
const markerInserts = content.match(/INSERT INTO `sml_markers`[^;]+;/g) || []
console.log(`Found ${markerInserts.length} marker insert statements`)

// Parse and convert to SQLite
let importedCount = 0

for (const insert of markerInserts) {
  // Remove INSERT INTO and get the VALUES part
  const valuesMatch = insert.match(/VALUES\s*(.+);/s)
  if (!valuesMatch) continue
  
  const valuesStr = valuesMatch[1]
  
  // Split by ), that are followed by ( or end
  const valueGroups = valuesStr.match(/\([^)]+\)/g) || []
  
  for (const group of valueGroups) {
    // Parse individual values
    const values = parseMySQLValues(group)
    if (values.length < 10) continue
    
    // Map columns: id, id_map, lat, lon, name, street, city, postal_code, country, website, 
    //             email, phone, hours, description, active, id_category
    // Old: sml_markers table structure
    // New: markers table
    
    try {
      const [
        id,           // 0
        id_map,       // 1
        lat,          // 2
        lon,          // 3
        name,         // 4
        street,       // 5
        city,         // 6
        postal_code,  // 7
        country,      // 8
        website,      // 9
        _website_caption, // 10
        email,        // 11
        phone,        // 12
        _whatsapp,    // 13
        hours,        // 14
        description,  // 15
        // ... extra fields skipped
        _extra1, _extra2, _extra3, _extra4, _extra5,
        _extra6, _extra7, _extra8, _extra9, _extra10,
        _extra11, _extra12, _extra13, _extra14, _extra15,
        _extra16, _extra17, _extra18, _extra19, _extra20,
        _extraButton1, _extraButtonIcon1, _extraButtonTitle1, _openExtraContent,
        _icon, _idIconLibrary,
        active,       // after extra fields
        _featured, _toValidate, _viewDirections, _viewReview, 
        _viewStreetView, _viewShare, _order, _centered,
        _colorHex, _colorHexHover, _iconColorHexHover, _iconColorHex,
        _markerSize,
        id_category,  // near end
        _accessCount, _minZoomLevel, _geofenceRadius, _geofenceColor,
        _openSheet, _viewPopup, _popupImageHeight, _popupBackground,
        _popupColor,
        _schedule     // last
      ] = values
      
      // Only import active markers
      if (active !== '1' && active !== 1) continue
      
      // Skip if no coordinates or name
      if (!lat || !lon || !name) continue
      
      // Get image from extra fields if present
      const image = null
      
      // Get category name if id_category exists
      const category = getCategoryName(id_category, content)
      
      // Insert into SQLite
      const insertSql = `
        INSERT INTO markers (map_id, name, lat, lon, description, category, image, street, city, postal_code, phone, website, email, hours, published, active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
      
      db.prepare(insertSql).run(
        id_map || 1,  // map_id
        unescapeMySQL(name),      // name
        parseFloat(lat),          // lat
        parseFloat(lon),          // lon
        unescapeMySQL(description) || null,  // description
        category || null,         // category
        image,                    // image
        unescapeMySQL(street) || null,       // street
        unescapeMySQL(city) || null,         // city
        postal_code || null,      // postal_code
        phone || null,            // phone
        website || null,          // website
        email || null,            // email
        unescapeMySQL(hours) || null,        // hours
        1,                        // published
        active === '1' || active === 1 ? 1 : 0  // active
      )
      
      importedCount++
    } catch (err) {
      // Skip problematic rows
      console.log('Skipping row:', err.message)
    }
  }
}

console.log(`Successfully imported ${importedCount} markers`)

// Helper function to parse MySQL VALUES
function parseMySQLValues(str) {
  // Remove outer parentheses
  str = str.trim()
  if (str.startsWith('(') && str.endsWith(')')) {
    str = str.slice(1, -1)
  }
  
  const values = []
  let current = ''
  let inString = false
  let stringChar = ''
  let i = 0
  
  while (i < str.length) {
    const char = str[i]
    
    if (inString) {
      if (char === stringChar && str[i+1] !== stringChar) {
        inString = false
        i++
        continue
      }
      current += char
      i++
    } else if (char === '"' || char === "'") {
      inString = true
      stringChar = char
      current += char
      i++
    } else if (char === ',') {
      values.push(current.trim())
      current = ''
      i++
    } else if (char === '\\' && str[i+1] === 'n') {
      current += '\n'
      i += 2
    } else {
      current += char
      i++
    }
  }
  
  if (current.trim()) {
    values.push(current.trim())
  }
  
  return values
}

// Helper to unescape MySQL strings
function unescapeMySQL(str) {
  if (!str) return null
  if (str === 'NULL') return null
  
  // Remove surrounding quotes if present
  if ((str.startsWith('"') && str.endsWith('"')) || 
      (str.startsWith("'") && str.endsWith("'"))) {
    str = str.slice(1, -1)
  }
  
  // Unescape
  str = str.replace(/\\'/g, "'")
  str = str.replace(/\\"/g, '"')
  str = str.replace(/\\\\/g, '\\')
  str = str.replace(/\\n/g, '\n')
  str = str.replace(/\\r/g, '\r')
  str = str.replace(/\\t/g, '\t')
  
  return str === '' ? null : str
}

// Helper to get category name from the dump
function getCategoryName(id_category, content) {
  if (!id_category || id_category === 'NULL') return null
  
  // Look for category in the dump
  const categoryMatch = content.match(new RegExp(
    `INSERT INTO \`sml_markers_categories\`[^;]*VALUES[^)]*\\(${id_category},[^)]*'([^']+)'`,
    'i'
  ))
  
  if (categoryMatch) {
    return unescapeMySQL(categoryMatch[1])
  }
  
  return null
}
