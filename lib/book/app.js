module.exports = class Book {

    constructor(){
        this.book = require('./openings.json');
    }

    find(moves){

        let result;

        result = this.book.find((e) => {

            if(e.moves.length != moves.length) return false

            for(let i = 0; i < moves.length; i++){
                if(e.moves[i] != moves[i]){
                    return false;
                }
            }
            return true;

        })

        if(result) return result;

        result = this.book.find((e) => {

            for(let i = 0; i < moves.length; i++){
                if(e.moves[i] != moves[i]){
                    return false;
                }
            }
            return true;

        });
        return result;  

    }

    is_book(moves){

        if(this.find(moves)){
            return true;
        }
        return false;

    }

}