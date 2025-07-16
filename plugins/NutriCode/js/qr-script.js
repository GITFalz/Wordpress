let meta_box_element;

(function(){
    meta_box_element = document.querySelector('.nutricode-meta-box');

    const qr = new QRious({
        value: stepData.permalink,
        size: 200,
        background: "white",
        foreground: "black"
    });
    
    const qr_canvas = qr.canvas;
    let canvas_element = document.getElementById('qr-code-canvas');
    if (canvas_element) {
        canvas_element.replaceWith(qr_canvas);
        qr_canvas.id = 'qr-code-canvas';
    }

    document.getElementById('download-qr-button').addEventListener('click', function () {
        const canvas = document.getElementById('qr-code-canvas');
        const image = canvas.toDataURL('image/png');

        const link = document.createElement('a');
        link.href = image;
        link.download = 'qr-code.png';
        link.click();
    });
})();