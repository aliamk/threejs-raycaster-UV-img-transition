varying float vNoise;
varying vec2 vUv;
// uniform sampler2D onTexture;
uniform sampler2D uImage;
uniform float time;
uniform float hoverState;

void main()	{
	vec2 newUV = vUv;
	vec2 p = newUV;
	float x = hoverState;

	x = smoothstep(.0, 1.0, (x * 2.0 + p. y - 1.0));

	vec4 imgAsColorOutput = mix(
		texture2D(uImage, (p - .5) * (1. - x) + .5),
		texture2D(uImage, (p - .5) * x + .5),
	x);

	vec4 onLogo = texture2D(uImage, vUv);	
	gl_FragColor = imgAsColorOutput;
	gl_FragColor.rgb += 0.05 * vec3(vNoise);

	// gl_FragColor = vec4(1., 0., 0.0, 1.);
	// vec2 newUV = (vUv - vec2(0.5))*resolution.zw + vec2(0.5);	

	// vec3 color1 = vec3(1., 0., 0.);
	// vec3 color2 = vec3(1., 1., 1.);
	// vec3 finalColor = mix(color1, color2, 0.5 * (vNoise + 1.));	

	// vec2 newUV = vUv;
	// vec4 onLogo = texture2D(uImage, newUV);
	// newUV = vec2(newUV.x, newUV.y + 0.01 * sin(newUV.x * 10. + time));
	// vec4 onLogo = texture2D(uImage, vUv);
	//
	// gl_FragColor = vec4(finalColor, 1.);
	// gl_FragColor = vec4(vUv, 0., 1.);
	// gl_FragColor = vec4(vNoise, 0., 0., 1.);
	// gl_FragColor = onLogo;
	// gl_FragColor.rgb += 0.15 * vec3(vNoise);
}