shader_type canvas_item;
uniform bool enabled = false;
uniform float darkness = 0.88;
uniform vec2 light_pos = vec2(160.,495.);
void fragment(){float d=distance(UV*vec2(1280.,720.),light_pos);float mask=enabled?smoothstep(90.,240.,d):1.;COLOR=vec4(.01,.015,.05,darkness*mask);}
