audio.io.AnalyserView = audio.io.View.extend({
    tagName: 'div',
    className: 'analyser',

    onmousemove: function(e) {
        e.preventDefault();
        e.stopPropagation();

        // FIXME: display freq at mouse cursor position readout
    },

    initialize: function() {
       _.bindAll(this);
       this.el.addEventListener('mousemove', this.onmousemove, false);
    },

    onControllerAttach: function() {
        this.createElements();
        this.setupCanvas();
    },

    render: function() {
        this.el.appendChild(this.label);
        this.el.appendChild(this.canvas);
        return this;
    },

    createElements: function() {
        var width = this.controller.get('width'),
            fontSize = Math.max(Math.floor(width / 2) - 2, 10);

        this.label = document.createElement('p');
        this.label.style.fontSize = fontSize + 'px';
        this.label.style.width = width + 'px';
    },

    setupCanvas: function() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.controller.get('width') || 50;
        this.canvas.height = this.controller.get('height') || 50;
        this.ctx = this.canvas.getContext('2d');
    },

    clearCanvas: function(ctx) {
        this.ctx.fillStyle = this.controller.get('backgroundColor');
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    },


    logTen: function( n ) {
        return Math.log(n) / Math.LN10;
    },

    logTwo: function(n) {
        return Math.log(n) / Math.LN2;
    },

    getP: function( f ) {
        return 69 + 12 * this.logTwo(f / 400);
    },

    getFreqPos: function( n ) {
        var type = this.controller.get('frequencyScaling');

        if(type === 'linear') {
            return n;
        }
        else if(type === 'log') {
            return this.logTen(n);
        }
    },

    getdBPos: function( n ) {
        var type = this.controller.get('dBScaling');

        if(type === 'linear') {
            return n;
        }
        else if(type === 'log') {
            return this.logTwo(n);
        }
    },

    draw: function( data ) {
        var value, logValue, logdB,
            width = this.canvas.width,
            height = this.canvas.height,
            ctx = this.ctx,
            length = data.length,
            bandwidth = width / this.getFreqPos(length-1),
            bandheight = height / this.getdBPos(256),
            display = this.controller.get('display'),
            showPeaks = this.controller.get('drawPeak'),
            prevPeaks, max = Math.max,

            mindB = this.controller.get('mindB'),
            maxdB = this.controller.get('maxdB'),
            dBRange = Math.abs(maxdB - mindB),
            dBStepSize = (height / dBRange) | 0,

            maxFreq = audio.io.context.sampleRate / 2,
            frequencyBinSize = maxFreq / length,
            currFreq;


        if(showPeaks) {
            prevPeaks = this.controller.get('peaks') || new Uint8Array(length);
        }


        this.clearCanvas();

        // Draw dB bars
        ctx.fillStyle = this.controller.get('barColor');

        for(var i = 0; i < 256; ++i) {

            if(i % 32 === 0) {
                ctx.fillStyle = this.controller.get('textColor');
                ctx.fillText(
                    (audio.io.utils.scaleNumber(i, 0, 256, mindB, maxdB) | 0) + 'dB',
                    0,
                    height-(i / 256 * height)-1
                );

                ctx.fillStyle = this.controller.get('barColor');
                ctx.fillRect(0, height-(i / 256 * height), width, 1);
            }
        }


        // Draw frequency bars
        ctx.font = 'sans-serif';

        var oneKCount = 0,
            tenKCount = 0,
            twentyKCount = 0;

        for(var i = 0; i < length; ++i) {
            currFreq = frequencyBinSize * i;

            if(currFreq < 100) {
                ctx.fillRect(this.getFreqPos(i) * bandwidth, 0, 1, height);
            }
            else if(currFreq < 1000) {
                if(oneKCount % 5 === 0) {
                    if(oneKCount === 0) {
                        ctx.fillStyle = this.controller.get('textColor');
                        ctx.fillText(parseInt(currFreq) + 'hz', this.getFreqPos(i) * bandwidth + 2, 10);

                        ctx.fillStyle = this.controller.get('accentuatedBarColor');
                        ctx.fillRect(this.getFreqPos(i) * bandwidth, 0, 1, height);

                        ctx.fillStyle = this.controller.get('barColor');
                    }
                    else {
                        ctx.fillRect(this.getFreqPos(i) * bandwidth, 0, 1, height);
                    }
                }
                ++oneKCount;
            }

            else if(currFreq < 10000) {
                if(tenKCount % 50 === 0) {
                    if(tenKCount === 0) {
                        ctx.fillStyle = this.controller.get('textColor');
                        ctx.fillText(parseInt(currFreq/1000) + 'khz', this.getFreqPos(i) * bandwidth + 2, 10);

                        ctx.fillStyle = this.controller.get('accentuatedBarColor');
                        ctx.fillRect(this.getFreqPos(i) * bandwidth, 0, 1, height);

                        ctx.fillStyle = this.controller.get('barColor');
                    }
                    else {
                        ctx.fillRect(this.getFreqPos(i) * bandwidth, 0, 1, height);
                    }
                }
                ++tenKCount;
            }

            else if(currFreq < 20000) {
                if(twentyKCount % 100 === 0) {
                    if(twentyKCount === 0) {
                        ctx.fillStyle = this.controller.get('textColor');
                        ctx.fillText(parseInt(currFreq/1000) + 'khz', this.getFreqPos(i) * bandwidth + 2, 10);

                        ctx.fillStyle = this.controller.get('accentuatedBarColor');
                        ctx.fillRect(this.getFreqPos(i) * bandwidth, 0, 1, height);

                        ctx.fillStyle = this.controller.get('barColor');
                    }
                    else {
                        ctx.fillRect(this.getFreqPos(i) * bandwidth, 0, 1, height);
                    }
                }
                ++twentyKCount;
            }
        }


        // Draw the actual data
        if(display === 'line') {
            ctx.strokeStyle = this.controller.get('bandColor');
            ctx.beginPath();
        }

        for(var i = 0; i < length; ++i) {
            value = data[i];

            if(showPeaks) {
                prevPeaks[i] = max(value, prevPeaks[i]);
            }

            logValue = this.getFreqPos(i);
            logdB = this.getdBPos(value);

            // Draw line point
            if(display === 'line') {
                if(i === 0) {
                    ctx.moveTo(logValue*bandwidth, height);
                }
                else {
                    ctx.lineTo(logValue*bandwidth, height-(logdB*bandheight));
                }
            }

            // Or draw a bar.
            else if(display === 'bar') {
                ctx.fillStyle = this.controller.get('bandColor');
                ctx.fillRect(logValue * bandwidth, height, 1, -(logdB * bandheight));
            }
        }

        if(display === 'line') {
            ctx.stroke();
            ctx.closePath();
        }


        // Draw peaks if specified
        if(showPeaks) {
            ctx.strokeStyle = this.controller.get('peakColor');
            ctx.beginPath();

            for(var i = 0; i < length; ++i) {
                value = prevPeaks[i];

                logValue = this.getFreqPos(i);
                logdB = this.getdBPos(value);

                // Draw line point
                if(i === 0) {
                    ctx.moveTo(logValue*bandwidth, height);
                }
                else {
                    ctx.lineTo(logValue*bandwidth, height-(logdB*bandheight));
                }
            }

            ctx.stroke();
            ctx.closePath();

            this.controller.set('peaks', prevPeaks);
        }
    }
});