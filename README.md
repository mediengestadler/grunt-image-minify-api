# Grunt Image Minifier

Image Minifier Grunt Task für https://github.com/ingowalther/image-minify-api, welcher die Bilder automatisiert an die API sendet, wieder empfängt und speichert.

## Optionen

### api_key *
Der API Key muss angegeben werden, damit der Bildkompressionsserver weiß, für welches Projekt aktuell Bilder resized werden (Pflichtangabe!)

### api_host *
Der API Host ist die URL, worüber der Bildkompressionsserver aufrufbar ist (Pflichtangabe!)

#### per_stack
per_stack legt fest, wieviele Bilder pro Runde gesendet werden sollen. Bei schwachen Servern, sollte hier eine niedrige Anzahl festgelegt werden. Die Zahl muss integer sein. Der Default Wert ist "10" (Optionale Angabe)

### log
log legt fest, ob ein Log Ordner mit den empfangenen JSON Ergebnissen erstellt werden soll. Dieser befindet sich auf der gleichen Ebene wie das Gruntfile. Der Wert muss ein boolean sein. Der Default Wert ist "false" (Optionale Angabe)

## Usage Examples

```
minifier: {
    options: {
        api_key: 'YOUR_API_KEY',
        api_host: 'YOUR_API_HOST'
    },
    example1: {
        src: ['src/images/*.png', 'src/images/test/*.{jpg,png}'],
        dest: 'build/images'
    },
    example2: {
        expand: true,
        cwd: 'images/foo/',
        src: ['bar/*.jpg', 'bar/**/*.jpg'],
        dest: 'compressed/'
    }
}
```
