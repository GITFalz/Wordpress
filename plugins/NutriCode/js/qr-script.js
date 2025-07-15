let meta_box_element;

(function(){
    meta_box_element = document.querySelector('.nutricode-meta-box');

    const qr = new QRious({
        value: stepData.permalink,
        size: 200,
        background: "white",
        foreground: "black"
    });
    
    meta_box_element.appendChild(qr.canvas);
})();