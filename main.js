// main.js
// Handles UI interactions and parameter sequence generation

function parseCSV(csv) {
    const lines = csv.trim().split('\n');
    const data = [];
    for (let line of lines) {
        const [x, y] = line.split(',').map(Number);
        if (!isNaN(x) && !isNaN(y)) {
            data.push({ x, y });
        }
    }
    return data;
}

function mse(data, predict) {
    let sum = 0;
    for (let point of data) {
        const error = point.y - predict(point.x);
        sum += error * error;
    }
    return sum / data.length;
}

function trainModel(modelType, data, learningRate, epochs) {
    let params;
    const sequence = [];
    if (modelType === 'y=b') {
        // Only intercept
        let b = 0;
        for (let i = 0; i < epochs; i++) {
            let grad = 0;
            for (let point of data) {
                grad += -2 * (point.y - b);
            }
            grad /= data.length;
            b -= learningRate * grad;
            sequence.push({ epoch: i + 1, b, mse: mse(data, x => b) });
        }
        params = { b };
    } else {
        // y = a * x
        let a = 0;
        for (let i = 0; i < epochs; i++) {
            let grad = 0;
            for (let point of data) {
                grad += -2 * point.x * (point.y - a * point.x);
            }
            grad /= data.length;
            a -= learningRate * grad;
            sequence.push({ epoch: i + 1, a, mse: mse(data, x => a * x) });
        }
        params = { a };
    }
    return { params, sequence };
}

function displaySequence(sequence, modelType) {
    let html = '<table border="1" cellpadding="6"><tr><th>Epoch</th>';
    if (modelType === 'y=b') {
        html += '<th>b</th>';
    } else {
        html += '<th>a</th>';
    }
    html += '<th>MSE</th></tr>';
    for (let row of sequence) {
        html += `<tr><td>${row.epoch}</td><td>${row[modelType === 'y=b' ? 'b' : 'a'].toFixed(4)}</td><td>${row.mse.toFixed(4)}</td></tr>`;
    }
    html += '</table>';
    return html;
}

function sequenceToText(sequence, modelType) {
    let lines = [];
    if (modelType === 'y=b') {
        lines.push('Epoch,b,MSE');
        for (let row of sequence) {
            lines.push(`${row.epoch},${row.b.toFixed(6)},${row.mse.toFixed(6)}`);
        }
    } else {
        lines.push('Epoch,a,MSE');
        for (let row of sequence) {
            lines.push(`${row.epoch},${row.a.toFixed(6)},${row.mse.toFixed(6)}`);
        }
    }
    return lines.join('\n');
}

// Event listener

document.getElementById('runBtn').addEventListener('click', () => {
    const modelType = document.getElementById('model').value;
    const learningRate = parseFloat(document.getElementById('learningRate').value);
    const epochs = parseInt(document.getElementById('epochs').value);
    const csv = document.getElementById('csvData').value;
    const output = document.getElementById('output');
    const paramSequence = document.getElementById('paramSequence');

    if (!csv || isNaN(learningRate) || isNaN(epochs) || epochs < 1) {
        output.innerHTML = '<span style="color:red">Please enter valid inputs for all fields.</span>';
        paramSequence.value = '';
        return;
    }

    const data = parseCSV(csv);
    if (data.length === 0) {
        output.innerHTML = '<span style="color:red">CSV data is invalid or empty.</span>';
        paramSequence.value = '';
        return;
    }

    const result = trainModel(modelType, data, learningRate, epochs);
    output.innerHTML = displaySequence(result.sequence, modelType);
    paramSequence.value = sequenceToText(result.sequence, modelType);
});

document.getElementById('copyBtn').addEventListener('click', () => {
    const paramSequence = document.getElementById('paramSequence');
    paramSequence.select();
    paramSequence.setSelectionRange(0, 99999); // For mobile devices
    document.execCommand('copy');
});
