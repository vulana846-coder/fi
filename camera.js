function previewCamera(event) {
    const file = event.target.files[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = e => {
        document.getElementById('cameraPreview').src = e.target.result;
        document.getElementById('cameraPreview').classList.remove('hidden');
        document.getElementById('cameraPlaceholder').classList.add('hidden');
        document.getElementById('analyzeBtn').classList.remove('hidden');
        document.getElementById('aiResult').classList.add('hidden');
    };
    r.readAsDataURL(file);
}

// пока заглушка — потом подключим настоящую нейросеть
function analyzeFish() {
    document.getElementById('aiResultName').textContent = 'определение рыбы';
    document.getElementById('aiResultDesc').textContent = 'функция в разработке. скоро появится нейросеть.';
    document.getElementById('aiResult').classList.remove('hidden');
}