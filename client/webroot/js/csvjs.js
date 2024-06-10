class CsvJS{
    constructor(fileInput,callback,header=null) {
        const file = fileInput.files[0];
        const self = this;
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const text = event.target.result;
                const delimiter = self.detectDelimiter(text);
                const jsonData = self.csvToJson(text, delimiter,header);
                callback(jsonData);
            };
            reader.readAsText(file);
            return true;
        } else {
            console.log('Please select a CSV file first.');
            return false;
        }   
    }

    detectDelimiter(text) {
        const delimiters = [',', ';', '\t'];
        const lines = text.split('\n');
        let counts = delimiters.map(delimiter => ({
            delimiter: delimiter,
            count: lines.slice(0, 5).reduce((total, line) => total + (line.split(delimiter).length - 1), 0)
        }));
        counts.sort((a, b) => b.count - a.count);
        return counts[0].delimiter;
    }

    csvToJson(csv, delimiter, header) {
        const self = this;
        let lines = csv.split('\n');
        let result = [];
        if(header == null){
            for (let i = 0; i < lines.length; i++) {
                const currentline = self.parseCSVLine(lines[i], delimiter);
                result.push(currentline);
            }
        }else{
            let headers = self.parseCSVLine(lines[header], delimiter);
            for (let i = 0; i < lines.length; i++) {
                if(i != header){
                    let obj = {};
                    const currentline = self.parseCSVLine(lines[i], delimiter);

                    for (let j = 0; j < headers.length; j++) {
                        obj[headers[j]] = currentline[j];
                    }
                    result.push(obj);
                }
            }
        }

        

        return result; // formatted JSON output
    }

    parseCSVLine(line, delimiter) {
        const fields = [];
        let field = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"' && i < line.length - 1 && line[i + 1] === '"') {
                // Handle escaped quotes inside fields
                field += '"';
                i++; // Skip the next quote
            } else if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === delimiter && !inQuotes) {
                // End of a field
                if(field=='"'){
                    field='';
                }
                if(field.substring(0,1) =='"' && field.substring(-1) =='"'){
                    field=field.substring(1,-1);
                }
                fields.push(field);
                field = '';
            } else {
                field += char;
            }
        }
        if(field=='"'){
            field='';
        }
        if(field.substring(0,1) =='"' && field.substring(-1) =='"'){
            field=field.substring(1,-1);
        }
        // Push the last field, as there won't be a comma at the end of the line
        fields.push(field);

        return fields;
    }
}
