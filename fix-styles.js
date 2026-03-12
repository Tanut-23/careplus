const fs = require('fs')
const path = require('path')

function traverse(dir) {
  const files = fs.readdirSync(dir)
  for (const file of files) {
    const fullPath = path.join(dir, file)
    if (fs.statSync(fullPath).isDirectory()) {
      traverse(fullPath)
    } else if (fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8')
      let newContent = content
        .replace(/className=\{errors.*? \? "text-destructive" : ""\}/g, "")
        .replace(/<p className="text-sm text-destructive">/g, '<p className="text-xs text-destructive mt-1">')

      // clean up any extra spaces
      newContent = newContent.replace(/<FieldLabel >/g, '<FieldLabel>')
      newContent = newContent.replace(/<Label (htmlFor="[^\"]+") >/g, '<Label $1>')
      
      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent)
        console.log("Updated", fullPath)
      }
    }
  }
}
traverse('c:/Users/sss/OneDrive/เดสก์ท็อป/CarePlus/app')
