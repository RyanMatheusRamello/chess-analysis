# chess-analysis
Analizador de partidas de xadrez

## Instalação

```
npm i chess-analysis
```

## Como usar

O pacote exporta uma classe que deve ser instanciada com uma string contendo o endereço para uma engine uci (como o stockfish)

```js
const Analysis = require("chess-analysis");
const analysis = new Analysis("stockfish.exe");
```

Utilize a função game para analizar uma partida

```js
analysis.game(pgn, onComplete, onMove);
```

## Examples

```js
const Analysis = require("chess-analysis");
const { join } = require("path");

const analysis = new Analysis(join(process.cwd(), "stockfish_14.1_win_32bit.exe"));

function onMove(result){
  console.log("Movimento analizado", result);
}
function onComplete(response){
  console.log("Partida finalizada", response.getData().precision);
}

analysis.game("1. e4 d5 2. exd5 Qxd5 3. Nf3 Bg4 4. Be2 Nc6 5. Nc3 Qd7 6. h3 Bxf3 7. Bxf3 O-O-O 8. O-O Nd4 9. a4 Kb8 10. Nb5 Nxf3+ 11. Qxf3 a6 12. c4 e5 13. d4 exd4 14. Bf4 axb5 15. axb5 Bd6 16. Ra2 Qf5 17. Rfa1 Kc8 18. Qc6", onComplete, onMove);
