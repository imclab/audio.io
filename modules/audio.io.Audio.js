
audio.io.Audio = audio.io.Node.extend({

	// This object will hold any LFO or envelope instances
	// that will connect to targetted attributes such as
	// gain levels, frequencies, etc.
	modSources: {},

	// Modulatable attributes (such as the gain levels and
		// frequencies mentioned above) will be stored here.
	modAttributes: {},

	// Setup is run *before* initialize. Allows us to create shared
	// methods & properties without interfering with any initialization
	// logic in each Node.
	setup: function() {
		// Create in and out ports
		this.input = this._io.context.createGainNode();
		this.output = this._io.context.createGainNode();
	},

	connectMod: function( modSource, targetAttribute ) {
		// If the attribute is allowed to be modulated
		// store this modSource so we can reference it
		// when needed.

		// if( this.modAttributes.hasOwnProperty( targetAttribute ) ) {
			this.modSources[ targetAttribute ] = modSource;
		// }
	},

	connect: function( source ) {

		if( source instanceof this._io.Controller ) {
			this.output.connect( source.node.input );
		}

		// If we're dealing with an audio.io.Audio node,
		// we know we have an input to connect to, so
		// go ahead and do just that.
		else if( source instanceof this._io.Audio ) {
			this.output.connect(source.input);
		}

		// Otherwise, try to connect to the source directly...
		else {
			this.output.connect( source );
		}
	}
});