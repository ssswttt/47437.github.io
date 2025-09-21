/*
  Function:XX
  Author  :sxy
  Date    :20230901
  Version :1.0
*/

// ..................变量声明区...................
var canvas = document.getElementById("mycanvas"),
  context = canvas.getContext("2d");

var loc = { x: 0, y: 0 }; // 鼠标位置

var text; // 文本内容

// ..................函数定义区...................

// .....自定义函数区.....
// 清屏
function clear(canvas) {
  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
}

// 绘制文本
function drawText(loc, text) {
  context.fillText(text, loc.x, loc.y); // 填充文本
  context.strokeText(text, loc.x, loc.y); // 描边文本
}

function exit() {
  // 清屏
  clear(canvas);

  // 处理样式
  text = 'End';
  context.font = "bold 70pt Times New Roman"; // 设字体
  context.textAlign = 'center';
  context.textBaseline = 'middle';

  context.lineWidth = 5;
  context.fillStyle = 'rgba(186,184,108,1)';

  // 处理绘制
  loc.x = canvas.width / 2;
  loc.y = canvas.height / 2;
  text = 'The End';
  drawText(loc, text);

  // 处理事件
  document.removeEventListener('keydown', onKeydown);
  canvas.removeEventListener('click', onCanvasClick);
}

// .....事件响应函数区.....
function onCanvasClick(e) {
  console.log('click'); // 调试用

  clear(canvas); // 清屏

  // 改变样式
  context.textAlign = 'left';
  context.textBaseline = 'top';
  context.lineWidth = 1;

  context.font = "bold " + parseInt(Math.random() * 200) + "pt Times New Roman";
  console.log(context.font);

  // 改变文字
  text = 'Hello';
  loc = windowToCanvas(canvas, e.clientX, e.clientY);
  drawText(loc, text);

  // 允许键盘响应
  document.addEventListener('keydown', onKeydown);
}

function onKeydown() {
  console.log('keydown'); // 调试用

  exit();
}

// 初始化函数
function init() {
  console.log('页面初始化');

  // 设置初始样式
  text = 'Click to Start';
  context.font = "bold 70pt Times New Roman"; // 设字体
  context.textAlign = 'center';
  context.textBaseline = 'middle';

  context.lineWidth = 5;
  context.fillStyle = 'rgba(186,184,108,1)';

  // 绘制初始内容
  loc.x = canvas.width / 2;
  loc.y = canvas.height / 2;
  drawText(loc, text);

  // 注册事件响应
  canvas.addEventListener('click', onCanvasClick);
}

// ..................页面初始化入口....................
init();