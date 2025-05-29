var w = c.width = window.innerWidth,
    h = c.height = window.innerHeight,
    ctx = c.getContext('2d'),
    hw = w / 2,
    hh = h / 2,
    opts = {
      strings: ['HAPPY', 'BIRTHDAY', 'PRINCESS!'],
      charSize: Math.min(40, window.innerWidth / 15),
      charSpacing: Math.min(45, window.innerWidth / 12),
      lineHeight: 50,
      cx: w / 2,
      cy: h / 2,
      fireworkPrevPoints: 5,
      fireworkBaseLineWidth: 5,
      fireworkAddedLineWidth: 8,
      fireworkSpawnTime: 200,
      fireworkBaseReachTime: 30,
      fireworkAddedReachTime: 30,
      fireworkCircleBaseSize: 20,
      fireworkCircleAddedSize: 10,
      fireworkCircleBaseTime: 30,
      fireworkCircleAddedTime: 30,
      fireworkCircleFadeBaseTime: 10,
      fireworkCircleFadeAddedTime: 5,
      fireworkBaseShards: 3,
      fireworkAddedShards: 3,
      fireworkShardPrevPoints: 3,
      fireworkShardBaseVel: 4,
      fireworkShardAddedVel: 2,
      fireworkShardBaseSize: 3,
      fireworkShardAddedSize: 3,
      gravity: .1,
      upFlow: -.1,
      letterContemplatingWaitTime: 360,
      balloonSpawnTime: 20,
      balloonBaseInflateTime: 10,
      balloonAddedInflateTime: 10,
      balloonBaseSize: 20,
      balloonAddedSize: 20,
      balloonBaseVel: .4,
      balloonAddedVel: .4,
      balloonBaseRadian: -(Math.PI / 2 - .5),
      balloonAddedRadian: -1,
    },
    calc = {
      totalWidth: opts.charSpacing * Math.max(...opts.strings.map(s => s.length))
    },
    Tau = Math.PI * 2,
    TauQuarter = Tau / 4,
    letters = [];

ctx.font = opts.charSize + 'px "Dancing Script"';

// Compliment and balloon setup
const compliments = ['Eph', 'Babe', 'Mylove', 'Sheblit', 'Princess', 'Queen', 'Bae', 'Mine', 'Ma Shayla'];
const complimentContainer = document.getElementById('compliment-container');
const balloonContainer = document.getElementById('balloon-container');
let complimentIndex = 0;

// Create 17 balloons
function createBalloons() {
  const balloonCount = 17;
  const spacing = w / balloonCount;
  const cycleDuration = 6; // 6s for rainbow cycle
  const delayIncrement = cycleDuration / 6; // 1s per color
  for (let i = 0; i < balloonCount; i++) {
    const balloon = document.createElement('div');
    balloon.className = 'balloon';
    balloon.style.left = `${spacing * i + spacing / 2}px`;
    balloon.style.top = `${15 + Math.random() * 20}px`;
    // Assign delay to start at different colors (0s, 1s, 2s, ..., 5s)
    const delay = (i % 6) * delayIncrement;
    balloon.style.animation = `float 4s ease-in-out infinite, rainbow ${cycleDuration}s linear infinite ${delay}s`;
    balloon.addEventListener('click', () => {
      balloon.classList.add('pop');
      const x = parseFloat(balloon.style.left) + 25;
      const y = parseFloat(balloon.style.top) + 35;
      showCompliment(x, y, true);
      setTimeout(() => balloon.remove(), 300);
    });
    balloonContainer.appendChild(balloon);
  }
}

// Show compliment
function showCompliment(x, y, isRandom = false) {
  const compliment = document.createElement('div');
  compliment.className = 'compliment';
  compliment.textContent = isRandom
    ? compliments[Math.floor(Math.random() * compliments.length)]
    : compliments[complimentIndex];
  compliment.style.left = `${x}px`;
  compliment.style.top = `${y}px`;
  complimentContainer.appendChild(compliment);
  if (!isRandom) complimentIndex = (complimentIndex + 1) % compliments.length;
  setTimeout(() => compliment.remove(), 1500);
}

// Handle empty clicks
document.addEventListener('click', function(event) {
  if (event.target.closest('.surprise-btn, .gift-links, .modal-content, a, button, .balloon')) return;
  showCompliment(event.clientX, event.clientY, false);
});

function Letter(char, x, y) {
  this.char = char;
  this.x = x;
  this.y = y;
  this.dx = -ctx.measureText(char).width / 2; // Center each character
  this.dy = opts.charSize / 2;
  this.fireworkDy = this.y - hh;
  var hue = ((x + calc.totalWidth / 2) / calc.totalWidth * 360) % 360; // Adjust hue for center
  this.color = `hsl(${hue}, 80%, 60%)`;
  this.lightAlphaColor = `hsla(${hue}, 80%, 70%, alp)`;
  this.lightColor = `hsl(${hue}, 80%, 70%)`;
  this.alphaColor = `hsla(${hue}, 80%, 60%, alp)`;
  this.hearts = [];
  this.reset();
}

Letter.prototype.reset = function() {
  this.phase = 'firework';
  this.tick = 0;
  this.spawned = false;
  this.spawningTime = opts.fireworkSpawnTime * Math.random() |0;
  this.reachTime = opts.fireworkBaseReachTime + opts.fireworkAddedReachTime * Math.random() |0;
  this.lineWidth = opts.fireworkBaseLineWidth + opts.fireworkAddedLineWidth * Math.random();
  this.prevPoints = [[0, hh, 0]];
  this.hearts = [];
};

Letter.prototype.step = function() {
  if (this.phase === 'firework') {
    if (!this.spawned) {
      ++this.tick;
      if (this.tick >= this.spawningTime) {
        this.tick = 0;
        this.spawned = true;
      }
    } else {
      ++this.tick;
      var linearProportion = this.tick / this.reachTime,
          armonicProportion = Math.sin(linearProportion * TauQuarter),
          x = linearProportion * this.x,
          y = hh + armonicProportion * this.fireworkDy;
      if (this.prevPoints.length > opts.fireworkPrevPoints)
        this.prevPoints.shift();
      this.prevPoints.push([x, y, linearProportion * this.lineWidth]);
      var lineWidthProportion = 1 / (this.prevPoints.length - 1);
      for (var i = 1; i < this.prevPoints.length; ++i) {
        var point = this.prevPoints[i],
            point2 = this.prevPoints[i - 1];
        ctx.strokeStyle = this.alphaColor.replace('alp', i / this.prevPoints.length);
        ctx.lineWidth = point[2] * lineWidthProportion * i;
        ctx.beginPath();
        ctx.moveTo(point[0], point[1]);
        ctx.lineTo(point2[0], point2[1]);
        ctx.stroke();
      }
      if (this.tick >= this.reachTime) {
        this.phase = 'contemplate';
        this.circleFinalSize = opts.fireworkCircleBaseSize + opts.fireworkCircleAddedSize * Math.random();
        this.circleCompleteTime = opts.fireworkCircleBaseTime + opts.fireworkCircleAddedTime * Math.random() |0;
        this.circleCreating = true;
        this.circleFading = false;
        this.circleFadeTime = opts.fireworkCircleFadeBaseTime + opts.fireworkCircleFadeAddedTime * Math.random() |0;
        this.tick = 0;
        this.tick2 = 0;
        this.shards = [];
        this.hearts = [];
        var shardCount = opts.fireworkBaseShards + opts.fireworkAddedShards * Math.random() |0,
            angle = Tau / shardCount,
            cos = Math.cos(angle),
            sin = Math.sin(angle),
            x = 1,
            y = 0;
        for (var i = 0; i < shardCount; ++i) {
          var x1 = x;
          x = x * cos - y * sin;
          y = y * cos + x1 * sin;
          this.shards.push(new Shard(this.x, this.y, x, y, this.alphaColor));
          this.hearts.push(new Heart(this.x, this.y, x * 0.5, y * 0.5, this.alphaColor));
        }
      }
    }
  } else if (this.phase === 'contemplate') {
    ++this.tick;
    if (this.circleCreating) {
      ++this.tick2;
      var proportion = this.tick2 / this.circleCompleteTime,
          armonic = -Math.cos(proportion * Math.PI) / 2 + .5;
      ctx.beginPath();
      ctx.fillStyle = this.lightAlphaColor.replace('light', 50 + 50 * proportion).replace('alp', proportion);
      ctx.arc(this.x, this.y, armonic * this.circleFinalSize, 0, Tau);
      ctx.fill();
      if (this.tick2 > this.circleCompleteTime) {
        this.tick2 = 0;
        this.circleCreating = false;
        this.circleFading = true;
      }
    } else if (this.circleFading) {
      ctx.fillStyle = this.lightColor.replace('light', 70);
      ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);
      ++this.tick2;
      var proportion = this.tick2 / this.circleFadeTime,
          armonic = -Math.cos(proportion * Math.PI) / 2 + .5;
      ctx.beginPath();
      ctx.fillStyle = this.lightAlphaColor.replace('light', 100).replace('alp', 1 - armonic);
      ctx.arc(this.x, this.y, this.circleFinalSize, 0, Tau);
      ctx.fill();
      if (this.tick2 >= this.circleFadeTime)
        this.circleFading = false;
    } else {
      ctx.fillStyle = this.lightColor.replace('light', 70);
      ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);
    }
    for (var i = 0; i < this.shards.length; ++i) {
      this.shards[i].step();
      if (!this.shards[i].alive) {
        this.shards.splice(i, 1);
        --i;
      }
    }
    for (var i = 0; i < this.hearts.length; ++i) {
      this.hearts[i].step();
      if (!this.hearts[i].alive) {
        this.hearts.splice(i, 1);
        --i;
      }
    }
    if (this.tick > opts.letterContemplatingWaitTime) {
      this.phase = 'balloon';
      this.tick = 0;
      this.spawning = true;
      this.spawnTime = opts.balloonSpawnTime * Math.random() |0;
      this.inflating = false;
      this.inflateTime = opts.balloonBaseInflateTime + opts.balloonAddedInflateTime * Math.random() |0;
      this.size = opts.balloonBaseSize + opts.balloonAddedSize * Math.random() |0;
      var rad = opts.balloonBaseRadian + opts.balloonAddedRadian * Math.random(),
          vel = opts.balloonBaseVel + opts.balloonAddedVel * Math.random();
      this.vx = Math.cos(rad) * vel;
      this.vy = Math.sin(rad) * vel;
    }
  } else if (this.phase === 'balloon') {
    ctx.strokeStyle = this.lightColor.replace('light', 80);
    if (this.spawning) {
      ++this.tick;
      ctx.fillStyle = this.lightColor.replace('light', 70);
      ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);
      if (this.tick >= this.spawnTime) {
        this.tick = 0;
        this.spawning = false;
        this.inflating = true;
      }
    } else if (this.inflating) {
      ++this.tick;
      var proportion = this.tick / this.inflateTime,
          x = this.cx = this.x,
          y = this.cy = this.y - this.size * proportion;
      ctx.fillStyle = this.alphaColor.replace('alp', proportion);
      ctx.beginPath();
      generateBalloonPath(x, y, this.size * proportion);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, this.y);
      ctx.stroke();
      ctx.fillStyle = this.lightColor.replace('light', 70);
      ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);
      if (this.tick >= this.inflateTime) {
        this.tick = 0;
        this.inflating = false;
      }
    } else {
      this.cx += this.vx;
      this.cy += this.vy += opts.upFlow;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      generateBalloonPath(this.cx, this.cy, this.size);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(this.cx, this.cy);
      ctx.lineTo(this.cx, this.cy + this.size);
      ctx.stroke();
      ctx.fillStyle = this.lightColor.replace('light', 70);
      ctx.fillText(this.char, this.cx + this.dx, this.cy + this.dy + this.size);
      if (this.cy + this.size < -hh || this.cx < -hw || this.cx > hw)
        this.phase = 'done';
    }
  }
}

function Shard(x, y, vx, vy, color) {
  var vel = opts.fireworkShardBaseVel + opts.fireworkShardAddedVel * Math.random();
  this.vx = vx * vel;
  this.vy = vy * vel;
  this.x = x;
  this.y = y;
  this.prevPoints = [[x, y]];
  this.color = color;
  this.alive = true;
  this.size = opts.fireworkShardBaseSize + opts.fireworkShardAddedSize * Math.random();
}

Shard.prototype.step = function() {
  this.x += this.vx;
  this.y += this.vy += opts.gravity;
  if (this.prevPoints.length > opts.fireworkShardPrevPoints)
    this.prevPoints.shift();
  this.prevPoints.push([this.x, this.y]);
  var lineWidthProportion = this.size / this.prevPoints.length;
  for (var k = 0; k < this.prevPoints.length - 1; ++k) {
    var point = this.prevPoints[k],
        point2 = this.prevPoints[k + 1];
    ctx.strokeStyle = this.color.replace('alp', k / this.prevPoints.length);
    ctx.lineWidth = k * lineWidthProportion;
    ctx.beginPath();
    ctx.moveTo(point[0], point[1]);
    ctx.lineTo(point2[0], point2[1]);
    ctx.stroke();
  }
  if (this.prevPoints[0][1] > hh)
    this.alive = false;
}

function Heart(x, y, vx, vy, color) {
  this.vx = vx * (opts.fireworkShardBaseVel + opts.fireworkShardAddedVel * Math.random());
  this.vy = vy * (opts.fireworkShardBaseVel + opts.fireworkShardAddedVel * Math.random());
  this.x = x;
  this.y = y;
  this.prevPoints = [[x, y]];
  this.color = color;
  this.alive = true;
  this.size = (opts.fireworkShardBaseSize + opts.fireworkShardAddedSize * Math.random()) * 0.5;
}

Heart.prototype.step = function() {
  this.x += this.vx;
  this.y += this.vy += opts.gravity;
  if (this.prevPoints.length > opts.fireworkShardPrevPoints)
    this.prevPoints.shift();
  this.prevPoints.push([this.x, this.y]);
  var lineWidthProportion = this.size / 2;
  for (var k = 0; k < this.prevPoints.length - 1; ++k) {
    var point = this.prevPoints[k];
    ctx.fillStyle = this.color.replace('alp', k / this.prevPoints.length);
    ctx.beginPath();
    ctx.moveTo(point[0], point[1]);
    ctx.bezierCurveTo(
      point[0] - this.size, point[1] - this.size,
      point[0] - this.size, point[1] + this.size,
      point[0], point[1] + this.size
    );
    ctx.bezierCurveTo(
      point[0] + this.size, point[1] + this.size,
      point[0] + this.size, point[1] - this.size,
      point[0], point[1]
    );
    ctx.fill();
  }
  if (this.prevPoints[0][1] > hh)
    this.alive = false;
}

function generateBalloonPath(x, y, size) {
  ctx.moveTo(x, y);
  ctx.bezierCurveTo(
    x - size / 2, y - size / 2,
    x - size / 4, y - size,
    x, y - size
  );
  ctx.bezierCurveTo(
    x + size / 4, y - size,
    x + size / 2, y - size / 2,
    x, y
  );
}

function anim() {
  window.requestAnimationFrame(anim);
  ctx.fillStyle = 'rgba(26, 26, 61, 0.2)';
  ctx.fillRect(0, 0, w, h);
  ctx.translate(hw, hh);
  var done = true;
  for (var l = 0; l < letters.length; ++l) {
    letters[l].step();
    if (letters[l].phase !== 'done') done = false;
  }
  ctx.translate(-hw, -hh);
  if (done) for (var l = 0; l < letters.length; l++) letters[l].reset();
}

function triggerConfetti() {
  confetti({ particleCount: 100, spread: 70, colors: ['#ff69b4', '#ffcccb', '#fff'] });
}

for (let i = 0; i < opts.strings.length; i++) {
  const str = opts.strings[i];
  for (let j = 0; j < str.length; j++) {
    letters.push(new Letter(
      str[j],
      (j - (str.length - 1) / 2) * opts.charSpacing,
      (i - (opts.strings.length - 1) / 2) * opts.lineHeight
    ));
  }
}

createBalloons();
anim();

window.addEventListener('resize', function() {
  w = c.width = window.innerWidth;
  h = c.height = window.innerHeight;
  hw = w / 2;
  hh = h / 2;
  opts.charSize = Math.min(40, w / 15);
  opts.charSpacing = Math.min(45, w / 12);
  opts.cx = w / 2;
  opts.cy = h / 2;
  calc.totalWidth = opts.charSpacing * Math.max(...opts.strings.map(s => s.length));
  ctx.font = opts.charSize + 'px "Dancing Script"';
  ballotContainer.innerHTML = '';
  createBalloons();
  letters.length = 0;
  for (let i = 0; i < opts.strings.length; i++) {
    const str = opts.strings[i];
    for (let j = 0; j < str.length; j++) {
      letters.push(new Letter(
        str[j],
        (j - (str.length - 1) / 2) * opts.charSpacing,
        (i - (opts.strings.length - 1) / 2) * opts.lineHeight
      ));
    }
  }
});

canvas.addEventListener('click', function() {
  confetti({ particleCount: 50, spread: 60, colors: ['#ff69b4', '#ffcccb'], shapes: ['circle', 'square']});
  for (var l = 0; l < letters.length; l++) {
    letters[l].reset();
  }
});