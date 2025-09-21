function windowToCanvas(canvas, x, y) {
    var style = window.getComputedStyle(canvas);
    var bbox = canvas.getBoundingClientRect();

    // 平移到canvas(含padding, border)
    x -= bbox.left;
    y -= bbox.top;
    //再平移到canvas(不含padding, border):两种写法均可
    //    x -= parseFloat(mystyle['border-left-width']);
    //    y -= parseFloat(mystyle['border-top-width']);
    //    x -= parseFloat(mystyle['padding-left']);
    //    y -= parseFloat(mystyle['padding-top']);
    //    写法2
    x -= parseFloat(style.borderLeftWidth);
    y -= parseFloat(style.borderTopWidth);
    x -= parseFloat(style.paddingLeft);
    y -= parseFloat(style.paddingTop);
    // 当canvas元素和drawing surface尺寸不一致，缩放drawing surface
    x *= (parseFloat(style['width']) / canvas.width);
    y *= (parseFloat(style['height']) / canvas.height);

    return {
        x: x,
        y: y
    };
}