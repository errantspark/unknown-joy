let body = document.body
let drawCtx = document.getElementById('drawing').getContext('2d')
let imgCtx = document.getElementById('image').getContext('2d')
let lastImg

let processImg = (img, ctx, prams) => {
  //is there a cleaner way to do this?
  let zip = (a1,a2,fn) => a1.map((val,i) => fn(val,a2[i]))

  let {thicc, noise, steps, depth, width, height, density} = prams
  let {canvas: {width: cWidth}, canvas: {height: cHeight}} = ctx
  let gOffset = cHeight * depth
  let gWidth = cWidth * width
  let gHeight = cHeight * height - gOffset

  let imgSize = [img.width,img.height]
  let canSize = [cWidth, cHeight]
  let tarSize = [gWidth, gHeight]
  //let canSize = [gWidth, gHeight]

  let sizes = zip(imgSize,tarSize,Array.of)
  let scaleF = sizes.map(e => e[1]/e[0]).reduce((a,b) => Math.max(a,b))
  let scaledDims = imgSize.map(e => e*scaleF)
  let imgPos = zip(scaledDims,canSize,(a,b)=>-(a-b)/2)
  imgPos[1] = imgPos[1]+gOffset/2
  //end this 

  ctx.drawImage(img,0,0,...imgSize,...imgPos,...scaledDims)

  drawJoy(drawCtx, imgCtx, prams)
}

let prams = {
  steps: 140,
  noise: 1.5,
  depth: 0.04,
  width: 0.4, 
  height: 0.8,
  thicc: 2.8, //line thickness in pixels
  density: 12, //pixels between lines
}

let drawJoy = (drawCtx, imgCtx, prams) => {
  let {thicc, noise, steps, depth, width, height, density} = prams
  let {canvas: {width: cWidth}, canvas: {height: cHeight}} = drawCtx

  let gOffset = cHeight * depth
  let gWidth = cWidth * width
  let gHeight = cHeight * height - gOffset
  let lines = gHeight/density | 0
  let xStep = gWidth/steps

  let left = (cWidth-gWidth)/2
  let top = (cHeight-(gHeight+gOffset))/2+gOffset 

  //being joy :)
  drawCtx.fillStyle = "#000"//"rgba(255,0,0,0.3)";
  drawCtx.fillRect(0, 0, cWidth, cHeight)

  drawCtx.moveTo(left, top)
  drawCtx.strokeStyle = "#fff"

  let [lastx,lasty,liney] = [left,top,top]
  console.log({left, gWidth, top, lines, xStep, gOffset, gHeight, cHeight})
  drawCtx.lineWidth = thicc/2 
  for (l = 0; l < lines; l++) {
    drawCtx.beginPath()
    drawCtx.moveTo(lastx, liney+gOffset)
    for (i = 0; i < steps+1; i++) {
      let x = lastx + xStep

      let pxl = imgCtx.getImageData(x/2, liney/2, 1, 1).data.slice(0,3)
      let pxlB = pxl.reduce((a,b) => a+b)/3
      let yOff = pxlB/255 * gOffset

      let y = liney - yOff 
      drawCtx.lineTo(x, y)
      lastx = x
      lasty = y
    }
    drawCtx.lineTo(lastx, liney+gOffset)
    drawCtx.fill();

    lastx = left
    lasty = liney
    drawCtx.strokeStyle = "#fff"
    drawCtx.lineCap = "round" 

      drawCtx.beginPath()
    for (i = 0; i < steps+1; i++) {
      let x = lastx + xStep

      let pxl = imgCtx.getImageData(x/2, liney/2, 1, 1).data.slice(0,3)
      let pxlB = pxl.reduce((a,b) => a+b)/3
      let yOff = pxlB/255 * gOffset

      let y = liney - yOff 

      drawCtx.lineTo(x, y)
      drawCtx.stroke()
      drawCtx.beginPath()
      drawCtx.lineTo(x, y)
      lastx = x
      lasty = y
      drawCtx.lineWidth = 1+ thicc/2 *(pxlB/255) 
      //if (l === 14) console.log({x,y,wid: drawCtx.lineWidth})
    }
    //drawCtx.closePath()
    lastx = left
    liney = liney + density
    lasty = liney
  }
}

let redraw = () => processImg(lastImg,imgCtx,prams)

let preventDefault = event => {
  event.preventDefault()
}

let handleDrop = event => {
  event.preventDefault()
  let reader = new window.FileReader()
  reader.onload = event => {
    let img = new Image
    img.src = event.target.result
    lastImg = img
    img.onload = () => processImg(img,imgCtx,prams)
  }
  let file = event.dataTransfer.files[0]
  reader.readAsDataURL(file)
}

window.addEventListener('drop', preventDefault)
window.addEventListener('dragover', preventDefault)
body.addEventListener('drop', handleDrop)
