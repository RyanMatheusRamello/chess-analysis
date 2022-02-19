const MovesTypes = require("./movesTypes");
module.exports = class Response {

    constructor(){

        let moves = { white: [], black: [], header: {}, precision: { white: null, black: null}};
        const generateImage = (data, fen) => {
            let url = "https://chess.yuibot.xyz/?fen="+fen+"&move="+data.move.from+"-"+data.move.to+"&analysis=";
            if(data instanceof MovesTypes.brilhante){
                return { url: url+"brilhante", icon: "brilhante" };
            }
            if(data instanceof MovesTypes.melhor){
                return { url: url+"melhor", icon: "melhor" };
            }
            if(data instanceof MovesTypes.excelente){
                return { url: url+"excelente", icon: "excelente" };
            }
            if(data instanceof MovesTypes.bom){
                return { url: url+"bom", icon: "bom" };
            }
            if(data instanceof MovesTypes.imprudente){
                return { url: url+"imprudente", icon: "imprudente" };
            }
            if(data instanceof MovesTypes.deslize){
                return { url: url+"deslize", icon: "deslize" };
            }
            if(data instanceof MovesTypes.capivarada){
                return { url: url+"capivarada", icon: "capivarada" };
            }
            if(data instanceof MovesTypes.livro){
                return { url: url+"livro", icon: "livro" };
            }
            if(data instanceof MovesTypes.forcado){
                return { url: url+"forcado", icon: "forcado" };
            }
            if(data instanceof MovesTypes.vitoria_perdida){
                return { url: url+"vitoriaperdida", icon: "vitoriaperdida" };
            }
        }
        this.addMoveWhite = function(data, fen){
            data.image = generateImage(data, fen);
            moves.white.push(data);
        }
        this.addMoveBlack = function(data, fen){
            data.image = generateImage(data, fen);
            moves.black.push(data);
        }
        this.toJSON = () => {
            return JSON.stringify(this.getData(), null, 4);
        }
        this.getData = () => {
            return moves;
        }
        this.setOpening = (data) => {
            moves.header.Opening = data
        }
        this.calculePrecision = () => {
            let white = moves.white.filter(e => e.pts !== undefined);
            let black = moves.black.filter(e => e.pts !== undefined);
            console.log(white);
            moves.precision.white = (white.reduce((previousValue, currentValue) => previousValue + currentValue.pts, 0)/white.length).toFixed(1);
            moves.precision.black = (black.reduce((previousValue, currentValue) =>  previousValue + currentValue.pts, 0 )/black.length).toFixed(1);;
            return true;
        }

    }

}