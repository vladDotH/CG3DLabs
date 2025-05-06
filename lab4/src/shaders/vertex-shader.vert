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

attribute vec3 aPosition;
attribute vec4 aVertexColor;
attribute vec3 aNormal;

varying vec4 vColor;
varying vec3 vNormal;
varying vec4 vPosition;

vec4 lightCalc(in Light l) {
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
    + uMaterial.ambient * l.ambient * aVertexColor;

    return color;
}

void main(void) {
    vPosition = uViewMatrix * vec4(aPosition, 1.0);
    gl_Position = uProjectionMatrix * uViewMatrix * vec4(aPosition, 1.0);
    vNormal = normalize(uNormalMatrix * aNormal);

    vColor = aVertexColor;

    if (uPhong == true || uLightsCount <= 0) {
        return;
    }

    vColor = vec4(0,0,0,0);
    for (int i = 0; i < MaxLights; i++) {
        if (i >= uLightsCount) break;
        vColor += lightCalc(uLights[i]);
    }
    vColor.a = 1.0;
}