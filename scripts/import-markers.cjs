const fs = require('fs')
const Database = require('better-sqlite3')
const path = require('path')

const dbPath = path.join(process.cwd(), 'bodegalisten.db')
const db = new Database(dbPath)

// Read the MySQL dump
const mysqlDumpPath = '/Users/toby/Documents/Design-Assets/AI Library/Code/tobiasdo_bodega3.sql'
const content = fs.readFileSync(mysqlDumpPath, 'utf-8')

// Find the INSERT statement for sml_markers
const insertMatch = content.match(/INSERT INTO `sml_markers`[^;]+VALUES\s+([\s\S]*?);/)
if (!insertMatch) {
  console.log('No markers found in dump')
  process.exit(1)
}

const valuesSection = insertMatch[1]
// Split by ), that are followed by newline or end of string
const valueStrings = valuesSection.split(/\),\s*(?=\([^)]+\)|$)/)

let importedCount = 0

for (const valueStr of valueStrings) {
  if (!valueStr.trim() || !valueStr.startsWith('(')) continue
  
  // Parse values
  const values = []
  let current = ''
  let inString = false
  let stringChar = ''
  
  for (let i = 0; i < valueStr.length; i++) {
    const char = valueStr[i]
    
    if (inString) {
      if (char === stringChar && valueStr[i + 1] !== stringChar) {
        inString = false
        i++
        continue
      }
      current += char
    } else if (char === '"' || char === "'") {
      inString = true
      stringChar = char
      current += char
    } else if (char === ',') {
      values.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  
  if (current.trim()) values.push(current.trim())
  
  if (values.length < 10) continue
  
  // Map fields (based on sml_markers table structure)
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
    // extra fields 16-55
    _extra1, _extra2, _extra3, _extra4, _extra5,
    _extra6, _extra7, _extra8, _extra9, _extra10,
    _extra11, _extra12, _extra13, _extra14, _extra15,
    _extra16, _extra17, _extra18, _extra19, _extra20,
    _extra21, _extra22, _extra23, _extra24, _extra25,
    _extra26, _extra27, _extra28, _extra29, _extra30,
    _extra31, _extra32, _extra33, _extra34, _extra35,
    _extra36, _extra37, _extra38, _extra39, _extra40,
    _extraButton1, _extraButtonIcon1, _extraButtonTitle1, _openExtraContent,
    _icon, _idIconLibrary,
    active,       // after extra fields (around index 56)
    _featured, _toValidate, _viewDirections, _viewReview, 
    _viewStreetView, _viewShare, _order, _centered,
    _colorHex, _colorHexHover, _iconColorHexHover, _iconColorHex,
    _markerSize,
    id_category,  // around index 68
    _accessCount, _minZoomLevel, _geofenceRadius, _geofenceColor,
    _openSheet, _viewPopup, _popupImageHeight, _popupBackground,
    _popupColor,
    _schedule     // last
  ] = values
  
  // Only import active markers
  if (active !== '1' && active !== 1) continue
  
  // Skip if no coordinates or name
  if (!lat || !lon || !name || name === 'NULL') continue
  
  // Clean string values
  function clean(str) {
    if (!str || str === 'NULL') return null
    if ((str.startsWith('"') && str.endsWith('"')) || 
        (str.startsWith("'") && str.endsWith("'"))) {
      str = str.slice(1, -1)
    }
    str = str.replace(/\\'/g, "'")
    str = str.replace(/\\"/g, '"')
    str = str.replace(/\\\\/g, '\\')
    str = str.replace(/\\n/g, '\n')
    return str === '' ? null : str
  }
  
  try {
    db.prepare(`
      INSERT INTO markers (map_id, name, lat, lon, description, category, image, street, city, postal_code, phone, website, email, hours, published, active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id_map || 1,
      clean(name),
      parseFloat(lat),
      parseFloat(lon),
      clean(description),
      clean(id_category),
      null,
      clean(street),
      clean(city),
      postal_code || null,
      clean(phone),
      clean(website),
      clean(email),
      clean(hours),
      1,
      1
    )
    importedCount++
  } catch (err) {
    console.log('Error importing:', err.message)
  }
}

console.log(`Successfully imported ${importedCount} markers`)

// Also create a default map
const existingMap = db.prepare('SELECT id FROM maps WHERE code = ?').get('bars')
if (!existingMap) {
  db.prepare(`
    INSERT INTO maps (code, name, description, active, pwa_enable, language)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run('bars', 'Bodegalisten', 'Map of bars and restaurants', 1, 1, 'da')
  console.log('Created default map "bars"')
}
