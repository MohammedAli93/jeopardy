const fragShader = `
precision mediump float;

uniform sampler2D uMainSampler[%count%];
uniform float radius;

varying vec2 outTexCoord;
varying float outTexId;
varying vec4 outTint;

void main()
{
    // Toma el UV de Phaser y corrige el eje Y como en Godot 4
    vec2 uv = outTexCoord;
    uv.y = 1.0 - uv.y; 

    // Lógica original adaptada
    vec2 surface = vec2(0.5, 0.2);
    vec2 center = surface - vec2(0.0, radius);
    float base = length(uv - center);
    float height = base - radius;

    float xdiff = (uv.x - surface.x) / base * height;

    uv = clamp(vec2(uv.x - xdiff, surface.y + height), vec2(0.0), vec2(1.0));
    uv.y = 1.0 - uv.y;

    // Muestra la textura, solo el primer sampler en este contexto
    vec4 color = texture2D(uMainSampler[0], uv);

    // Si quieres aplicar tint, descomenta la siguiente línea
    // color *= outTint;

    gl_FragColor = color;
}
`;

export default class CurvedPostFX extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline
{
    _radius: number;
    constructor (game: Phaser.Game)
    {
        super({
            game,
            fragShader
        });

        this._radius = 5.5; // Valor por defecto
    }

    onPreRender ()
    {
        this.set1f('radius', this._radius);
    }

    get radius ()
    {
        return this._radius;
    }

    set radius (value)
    {
        this._radius = value;
    }
}