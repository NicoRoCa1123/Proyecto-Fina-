from flask import Flask, render_template, request

app = Flask(__name__)

EMISSIONS = {
    "streaming":  100,
    "busquedas":  0.2,
    "emails":     4,
    "redes":      36,
    "video":      157,
}
G_PER_KM = 96


def calcular_co2(datos):
    total = (
        datos["streaming"] * EMISSIONS["streaming"] +
        datos["busquedas"] * EMISSIONS["busquedas"] +
        datos["emails"]    * EMISSIONS["emails"]    +
        datos["redes"]     * EMISSIONS["redes"]     +
        datos["video"]     * EMISSIONS["video"]
    )
    return {
        "total_g":        round(total),
        "km_carro":       round(total / G_PER_KM, 1),
        "horas_lampara":  round(total / 8, 1),
        "dias_arbol":     round(total / (21000 / 365), 2),
    }


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/calcular", methods=["POST"])
def calcular():
    datos = {
        "streaming": float(request.form.get("streaming", 0)),
        "busquedas": float(request.form.get("busquedas", 0)),
        "emails":    float(request.form.get("emails", 0)),
        "redes":     float(request.form.get("redes", 0)),
        "video":     float(request.form.get("video", 0)),
    }
    resultado = calcular_co2(datos)
    return render_template("resultado.html", resultado=resultado, datos=datos)


if __name__ == "__main__":
    app.run(debug=True)