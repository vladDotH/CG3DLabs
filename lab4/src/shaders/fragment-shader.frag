precision highp float;

struct Light {
    vec4 diffuse;
    vec4 ambient;
    vec4 specular;
    vec4 position;
};

struct Material {
    vec4 diffuse;
    vec4 ambient;
    vec4 specular;
    float shininess;
};

const int MaxLights = 2;

uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;
uniform mat3 uNormalMatrix;

uniform mediump int uLightsCount;
uniform bool uPhong;
uniform Light uLights[MaxLights];
uniform Material uMaterial;
uniform bool uUseTexture;
uniform sampler2D uTexture;

varying vec4 vColor;
varying vec3 vNormal;
varying vec4 vPosition;
varying vec2 vTexCoord;

vec4 lightCalc(in Light l, in vec4 lColor) {
    vec3 L;
    if (l.position.w == 0.0) {
        L = normalize(l.position.xyz);
    }
    else {
        L = normalize(l.position.xyz - vPosition.xyz);
    }

    vec3 viewDir = normalize(-vPosition.xyz);
    vec3 reflectDir = reflect(-L, vNormal);
    float specCoef = pow(max(dot(viewDir, reflectDir), 0.0), uMaterial.shininess);
    float difCoef = max(dot(vNormal, L), 0.0);

    vec4 color = specCoef * uMaterial.specular * l.specular
    + difCoef * uMaterial.diffuse * l.diffuse
    + uMaterial.ambient * l.ambient * lColor;

    return color;
}

void main(void) {
    vec4 lColor = vColor;
    if (uUseTexture == true) {
        lColor = texture2D(uTexture, vTexCoord);
    }

    if (uPhong == false || uLightsCount <= 0) {
        if (uUseTexture) {
            gl_FragColor = lColor/2.0 + vColor/2.0;
        } else {
            gl_FragColor = lColor;
        }
        return;
    }

    vec4 color = vec4(0,0,0,0);
    for (int i = 0; i < MaxLights; i++) {
        if (i >= uLightsCount) break;
        color += lightCalc(uLights[i], lColor);
    }
    color.a = 1.0;

    gl_FragColor = color;
}