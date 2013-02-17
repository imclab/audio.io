audio.io.Analyser = audio.io.Audio.extend({
	initialize: function(granularity, interval, callback) {
		this.analyser = this._io.context.createAnalyser();

		this.granularity = granularity || 2048;
		this.intervalDuration = interval || 100;
		this.callback = callback || this._io.noop;

		this.analyser.smoothingTimeConstant = 0;
		this.analyser.fftSize = this.granularity;
		this.data = new Uint8Array( this.analyser.frequencyBinCount );

		this.input.connect(this.analyser);
		this.analyser.connect(this.output);
	},

	onProcess: function() {
		this.analyser.getByteFrequencyData(this.data);
		this.callback(this.data);
	},

	start: function() {
		this.interval = setInterval(this.onProcess.bind(this), this.intervalDuration);
	},
	stop: function() {
		clearInterval(this.interval);
	}
});


audio.io.StereoAnalyser = audio.io.Analyser.extend({
	initialize: function(granularity, interval, callback) {
		this.splitter = this._io.context.createChannelSplitter(2);
		this.merger = this._io.context.createChannelMerger(2);
		this.analyserL = this._io.context.createAnalyser();
		this.analyserR = this._io.context.createAnalyser();

		this.granularity = granularity || 2048;
		this.intervalDuration = interval || 100;
		this.callback = callback || this._io.noop;

		this.analyserL.smoothingTimeConstant = 0.3;
		this.analyserR.smoothingTimeConstant = 0.3;
		this.analyserL.fftSize = this.granularity;
		this.analyserR.fftSize = this.granularity;

		this.dataL = new Uint8Array( this.analyserL.frequencyBinCount );
		this.dataR = new Uint8Array( this.analyserR.frequencyBinCount );

		this.input.connect(this.splitter);

		this.splitter.connect(this.analyserL, 0);
		this.splitter.connect(this.analyserR, 1);

		this.analyserL.connect(this.merger, 0, 0);
		this.analyserR.connect(this.merger, 0, 1);

		this.merger.connect(this.output);
	},

	onProcess: function() {
		this.analyserL.getByteFrequencyData(this.dataL);
		this.analyserR.getByteFrequencyData(this.dataR);
		this.callback(this.dataL, this.dataR);
	}
});