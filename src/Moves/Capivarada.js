module.exports = function Capivarada(move, { type }) {

    this.name = "Capivarada";
    if(type !== "mate"){
        this.description = "Esse lance piora muito sua posição";
    }else{
        this.description = "Esse lance permite um mate forçado";
    }
    this.pts = 0;
    this.move = move;

}