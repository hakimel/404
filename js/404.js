
/**
 * Copyright (C) 2011 Hakim El Hattab, http://hakim.se
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 * @author Hakim El Hattab | http://hakim.se
 */
(function(){
	
	var DISPLAY_WIDTH = 960,
		DISPLAY_HEIGHT = 480,
		DISPLAY_DURATION = 10,
		OVERLAY_DURATION = 3;
	
	var	mouse = { x: 0, y: 0 },
		container,
		overlay,
		overlayOpacity = 1,
		canvas,
		context,
		startTime,
		eyes;
	
	function initialize() {
		container = document.getElementById( 'fof' );
		overlay = document.querySelector( '#fof>div' );
		canvas = document.querySelector( '#fof>canvas' );
		
		if( canvas ) {
			canvas.width = DISPLAY_WIDTH;
			canvas.height = DISPLAY_HEIGHT;
			
			context = canvas.getContext( '2d' );
			
			document.addEventListener( 'mousemove', function( event ) {
				mouse.x = event.clientX;
				mouse.y = event.clientY;
			}, false );
			
			eyes = [
				new Eye( canvas,   0.50, 0.50,   5.00,    0.10 ),
				
				new Eye( canvas,   0.19, 0.80,   0.88,    0.31 ), 
				new Eye( canvas,   0.10, 0.54,   0.84,    0.32 ), 
				new Eye( canvas,   0.81, 0.13,   0.63,    0.33 ), 
				new Eye( canvas,   0.89, 0.19,   0.58,    0.34 ), 
				new Eye( canvas,   0.40, 0.08,   0.97,    0.35 ), 
				new Eye( canvas,   0.64, 0.74,   0.57,    0.36 ), 
				new Eye( canvas,   0.41, 0.89,   0.56,    0.37 ), 
				new Eye( canvas,   0.92, 0.89,   0.75,    0.38 ), 
				new Eye( canvas,   0.27, 0.20,   0.87,    0.39 ), 
				new Eye( canvas,   0.17, 0.46,   0.68,    0.41 ), 
				new Eye( canvas,   0.71, 0.29,   0.93,    0.42 ), 
				new Eye( canvas,   0.84, 0.46,   0.54,    0.43 ), 
				new Eye( canvas,   0.93, 0.35,   0.63,    0.44 ), 
				new Eye( canvas,   0.77, 0.82,   0.85,    0.45 ), 
				new Eye( canvas,   0.36, 0.74,   0.90,    0.46 ), 
				new Eye( canvas,   0.13, 0.24,   0.85,    0.47 ), 
				new Eye( canvas,   0.58, 0.20,   0.77,    0.48 ), 
				new Eye( canvas,   0.55, 0.84,   0.87,    0.50 ), 
			];
			
			startTime = Date.now();
			
			animate();
		}
		else if( overlay ) {
			overlay.parentElement.removeChild( overlay );
		}
	}
	
	function animate() {
		// The number of seconds that have passed since initialization
		var seconds = ( Date.now() - startTime ) / 1000;
		
		// Out with the old ...
		context.clearRect( 0, 0, DISPLAY_WIDTH, DISPLAY_HEIGHT );
		
		// ... in with the new
		for( var i = 0, len = eyes.length; i < len; i++ ) {
			var eye = eyes[i];
			
			if( seconds > eye.activationTime * DISPLAY_DURATION ) {
				eye.activate();
			};
			
			eye.update( mouse );
		}
		
		// Remove the overlay if its time has passed
		if( seconds > OVERLAY_DURATION && overlay !== undefined ) {
			
			// Ease-in
			overlayOpacity *= 0.94 + ( 0.055 * overlayOpacity );
			overlayOpacity = Math.max( overlayOpacity - 0.01, 0 );
			
			overlay.style.opacity = overlayOpacity;
			
			if( overlayOpacity === 0 ) {
				// We have no more use for the overlay, removing it ensures
				// that we do not repeatedly enter this if statement
				container.removeChild( overlay );
				
				overlay = undefined;
			}
		}
		
		requestAnimFrame( animate );
	}
	
	window.addEventListener ? window.addEventListener( 'load', initialize, false ) : window.onload = initialize;
	
})();


function Eye( canvas, x, y, scale, time ) {
	this.canvas = canvas;
	this.context = this.canvas.getContext( '2d' )
	
	// The time at which this eye will come alive
	this.activationTime = time;
	
	// The speed at which the iris follows the mouse
	this.irisSpeed = 0.01 + ( Math.random() * 0.2 ) / scale;
	
	// The speed at which the eye opens and closes
	this.blinkSpeed = 0.2 + ( Math.random() * 0.2 );
	this.blinkInterval = 5000 + 5000 * ( Math.random() );
	
	// Timestamp of the last blink
	this.blinkTime = Date.now();
	
	this.scale = scale;
	this.size = 70 * scale;
	
	this.x = x * canvas.width; 
	this.y = y * canvas.height + ( this.size * 0.15 );
	
	this.iris = {
		x: this.x,
		y: this.y - ( this.size * 0.1 ),
		size: this.size * 0.2
	};
	
	this.pupil = {
		width: 2 * scale,
		height: this.iris.size * 0.75
	};
	
	this.exposure = {
		top: 0.1 + ( Math.random() * 0.3 ),
		bottom: 0.5 + ( Math.random() * 0.3 ),
		current: 0,
		target: 1
	};
	
	// Affects the amount of inner shadow
	this.tiredness = ( 0.5 - this.exposure.top ) + 0.1;
	
	this.isActive = false;
	
	this.activate = function() {
		this.isActive = true;
	}
	
	this.update = function( mouse ) {
		if( this.isActive === true ) {
			this.render( mouse );
		}
	}
	
	this.render = function( mouse ) {
		var time = Date.now();
		
		if( this.exposure.current < 0.012 ) {
			this.exposure.target = 1;
		}
		else if( time - this.blinkTime > this.blinkInterval ) {
			this.exposure.target = 0;
			this.blinkTime = time;
		}
		
		this.exposure.current += ( this.exposure.target - this.exposure.current ) * this.blinkSpeed;
		
		// Eye left/right
		var el = { x: this.x - ( this.size * 0.8 ), y: this.y - ( this.size * 0.1 ) };
		var er = { x: this.x + ( this.size * 0.8 ), y: this.y - ( this.size * 0.1 ) };
		
		// Eye top/bottom
		var et = { x: this.x, y: this.y - ( this.size * ( 0.5 + ( this.exposure.top * this.exposure.current ) ) ) };
		var eb = { x: this.x, y: this.y - ( this.size * ( 0.5 - ( this.exposure.bottom * this.exposure.current ) ) ) };
		
		// Eye inner shadow top
		var eit = { x: this.x, y: this.y - ( this.size * ( 0.5 + ( ( 0.5 - this.tiredness ) * this.exposure.current ) ) ) };
		
		// Eye iris
		var ei = { x: this.x, y: this.y - ( this.iris.size ) };
		
		// Offset the iris depending on mouse position
		var eio = { 
			x: ( mouse.x - ei.x ) / ( window.innerWidth - ei.x ), 
			y: ( mouse.y ) / ( window.innerHeight )
		};
		
		// Apply the iris offset
		ei.x += eio.x * 16 * Math.max( 1, this.scale * 0.4 );
		ei.y += eio.y * 10 * Math.max( 1, this.scale * 0.4 );
		
		this.iris.x += ( ei.x - this.iris.x ) * this.irisSpeed;
		this.iris.y += ( ei.y - this.iris.y ) * this.irisSpeed;
		
		// Eye fill drawing
		this.context.fillStyle = 'rgba(255,255,255,1.0)';
		this.context.strokeStyle = 'rgba(100,100,100,1.0)';
		this.context.beginPath();
		this.context.lineWidth = 3;
		this.context.lineJoin = 'round';
		this.context.moveTo( el.x, el.y );
		this.context.quadraticCurveTo( et.x, et.y, er.x, er.y );
		this.context.quadraticCurveTo( eb.x, eb.y, el.x, el.y );
		this.context.closePath();
		this.context.stroke();
		this.context.fill();
		
		// Iris
		this.context.save();
		this.context.globalCompositeOperation = 'source-atop';
		this.context.translate(this.iris.x*0.1,0);
		this.context.scale(0.9,1);
		this.context.strokeStyle = 'rgba(0,0,0,0.5)';
		this.context.fillStyle = 'rgba(130,50,90,0.9)';
		this.context.lineWidth = 2;
		this.context.beginPath();
		this.context.arc(this.iris.x, this.iris.y, this.iris.size, 0, Math.PI*2, true);
		this.context.fill();
		this.context.stroke();
		this.context.restore();
		
		// Iris inner
		this.context.save();
		this.context.shadowColor = 'rgba(255,255,255,0.5)';
		this.context.shadowOffsetX = 0;
		this.context.shadowOffsetY = 0;
		this.context.shadowBlur = 2 * this.scale;
		this.context.globalCompositeOperation = 'source-atop';
		this.context.translate(this.iris.x*0.1,0);
		this.context.scale(0.9,1);
		this.context.fillStyle = 'rgba(255,255,255,0.2)';
		this.context.beginPath();
		this.context.arc(this.iris.x, this.iris.y, this.iris.size * 0.7, 0, Math.PI*2, true);
		this.context.fill();
		this.context.restore();
		
		// Pupil
		this.context.save();
		this.context.globalCompositeOperation = 'source-atop';
		this.context.fillStyle = 'rgba(0,0,0,0.9)';
		this.context.beginPath();
		this.context.moveTo( this.iris.x, this.iris.y - ( this.pupil.height * 0.5 ) );
		this.context.quadraticCurveTo( this.iris.x + ( this.pupil.width * 0.5 ), this.iris.y, this.iris.x, this.iris.y + ( this.pupil.height * 0.5 ) );
		this.context.quadraticCurveTo( this.iris.x - ( this.pupil.width * 0.5 ), this.iris.y, this.iris.x, this.iris.y - ( this.pupil.height * 0.5 ) );
		this.context.fill();
		this.context.restore();
		
		this.context.save();
		this.context.shadowColor = 'rgba(0,0,0,0.9)';
		this.context.shadowOffsetX = 0;
		this.context.shadowOffsetY = 0;
		this.context.shadowBlur = 10;
		
		// Eye top inner shadow
		this.context.fillStyle = 'rgba(120,120,120,0.2)';
		this.context.beginPath();
		this.context.moveTo( el.x, el.y );
		this.context.quadraticCurveTo( et.x, et.y, er.x, er.y );
		this.context.quadraticCurveTo( eit.x, eit.y, el.x, el.y );
		this.context.closePath();
		this.context.fill();
		
		this.context.restore();
		
	}
}

// shim with setTimeout fallback from http://paulirish.com/2011/requestanimationframe-for-smart-animating/
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       || 
          window.webkitRequestAnimationFrame || 
          window.mozRequestAnimationFrame    || 
          window.oRequestAnimationFrame      || 
          window.msRequestAnimationFrame     || 
          function(/* function */ callback, /* DOMElement */ element){
            window.setTimeout(callback, 1000 / 60);
          };
})();
