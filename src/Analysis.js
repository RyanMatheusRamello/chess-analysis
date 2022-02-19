const MovesTypes = require("./movesTypes");
const Book = require("../lib/book/app");
const { Engine } = require("node-uci");
const { Chess } = require("chess.js");
const Response = require("./Response");

module.exports = class Analysis {

    constructor(engine){

        this.engine = new Engine(engine);
        this.book = new Book();
        this.startFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
        this.finalHeaders = {};

    }

    async move(before, after, move, chess){
        if(after.end){
            return new MovesTypes.melhor(move, after.score);
        }
        // Verificar se é lance de livro
        if(this.book.is_book(chess.history())){
            this.finalHeaders.opening = this.book.find(chess.history());
            return new MovesTypes.livro(move, after.score);
        }

        // Verifica se só tem um lance possivel
        if(chess.moves().length == 1){
            return new MovesTypes.forcado(move, after.score);
        }

        // Verifica se é brilhante
        if(this.isBrilhante(before.score, after.score, after.analysis[0], after.analysis[1], after.analysis[2], move)){
            return new MovesTypes.brilhante(move, after.score);
        }

        // Verifica se antes é o melhor lance
        if(before.bestmove == move.from+move.to){
            return new MovesTypes.melhor(move, after.score);
        }

        // Verifica se mudou de cp para mate ou de mate para cp
        if(before.score.unit == "cp" && after.score.unit !== "cp"){
            let val = after.score.value*-1;
            if(val >= 0){
                return new MovesTypes.brilhante(move, after.score);
            }else{
                return new MovesTypes.capivarada(move, after.score);
            }
        }

        if(before.score.unit != "cp" && after.score.unit == "cp"){
            let val = before.score.value;
            if(chess.turn() == "b"){
                val *= -1;
            }
            if(chess.turn() == "w"){
                if(val > 0){
                    return new MovesTypes.vitoria_perdida(move, after.score); 
                }
            }else{
                if(val < 0){
                    return new MovesTypes.vitoria_perdida(move, after.score); 
                }
            }
        }

        let val = after.score.value*-1;

        if(before.score.value < val){
            return new MovesTypes.excelente(move, after.score); 
        }

        if(before.score.value < val+70){
            return new MovesTypes.bom(move, after.score); 
        }

        if(before.score.value < val+150){
            return new MovesTypes.imprudente(move, after.score); 
        }

        if(before.score.value < val+300){
            return new MovesTypes.deslize(move, after.score); 
        }

        return new MovesTypes.capivarada(move, after.score); 
        
    }

    async game(pgn, callback = console.log, onMove = () => {}){
        await this.engine.init();
        await this.engine.setoption('MultiPV', '3')
        const chess = new Chess();
        chess.load_pgn(pgn);
        let history = chess.history({ verbose: true });
        const CHESS = new Chess();
        const CHESSB = new Chess();
        let before = await this.#analysis_move(13, [ this.startFen ]);
        before.score = this.getScore(before.analysis);
        before.moves = CHESS.moves();
        let response = new Response();
        for(let move of history){
            CHESSB.move(move.san);
            let after = await this.#analysis_move(13, [CHESSB.fen()]);
            if(!after.end)
            after.score = this.getScore(after.analysis);
            let res = await this.move(before, after, move, CHESS);
            if(CHESS.turn() == "w"){
                response.addMoveWhite(res, CHESSB.fen());
            }else{
                response.addMoveBlack(res, CHESSB.fen());
            }
            onMove(res);
            CHESS.move(move.san);
            before = after;
        }
        response.setOpening(this.finalHeaders.opening);
        response.calculePrecision();
        callback(response);
        require("fs").writeFileSync("data.json", response.toJSON());

    }

    isBrilhante(antes, depois, a, b, c, move){
        // Se tiver uma posição de mate não retornar como brilhante
        if(a.score.unit != "cp" || b.score.unit != "cp" || c.score.unit == "cp"){
            return false;
        }
        // Se antes era mate, não considere lance brilhante
        if(antes.unit == "mate"){
            return false;
        }
        // Se o valor antes for menor que 0
        if(antes.value < 0){
            let i = 0;
            let z = 0;
            if(a.score.value*-1 >= antes.value) { i++; z=0; }
            if(b.score.value*-1 >= antes.value) { i++; z=1; }
            if(c.score.value*-1 >= antes.value) { i++; z=2; }
            if(i === 1){
                let an = [a, b, c];
                if(an[z].move.startsWith(move.from+move.to)){
                    return true;
                }
                return false;
            }
        }
        return false;
    }

    getScore(data){
        data.sort((a, b) => {
            if(a.score.unit != "cp" && b.score.unit != "cp"){
                if(a.score.value >= 0 && b.score.value >= 0) return ( a.score.value - b.score.value ) * -1
                if(a.score.value >= 0) return 1;
                if(b.score.value >= 0) return -1;
                return ( a.score.value - b.score.value ) * -1;
            }
            if(a.score.unit != "cp" && b.score.unit == "cp"){
                if(a.score.value >= 0) return 1;
                return -1;
            }
            if(a.score.unit == "cp" && b.score.unit != "cp"){
                if(b.score.value >= 0) return -1;
                return 1;
            }
            return a.score.value - b.score.value
        });
        data.reverse();
        return data[0].score;
    }

    async #analysis_move(depth, pos){
        await this.engine.position(...pos);
        const result = await this.engine.go({ depth });
        let data = {};
        if(result.bestmove == "(none)"){
            return {
                end: true
            }
        }
        data.bestmove = result.bestmove;
        data.ponder = result.ponder;
        data.analysis = result.info.slice(-3);
        for(let i in data.analysis){
            data.analysis[i].move = data.analysis[i].pv.split(" ").shift();
        }

        return data;

    }

}