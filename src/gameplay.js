var amountDiamonds = 30;

GamePlayManager = {
    init: function() {
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;

        //Creamos un boolean para que el juego empieza en el primer click
        this.flagFirstMouseDown = false;
    },
    preload: function() {
        game.load.image('background', 'assets/images/background.png');
        //Cargar sprite, con el ancho, alto y número de frames
        game.load.spritesheet('horse', 'assets/images/horse.png', 84, 156, 2);
        game.load.spritesheet('diamonds', 'assets/images/diamonds.png', 81, 84, 4);

        game.load.image('explosion', 'assets/images/explosion.png');

    },
    create: function() {
        game.add.sprite(0, 0, 'background');
        // El this.horse es para crear una instancia
        this.horse = game.add.sprite(0, 0, 'horse');
        this.horse.frame = 1;
        // Posicionar el sprite en medio de la pantalla
        this.horse.x = game.width / 2;
        this.horse.y = game.height / 2;
        //Hace que el punto de referenca del sprite no sea el 0,0, si no que sea el centro de la imagen
        this.horse.anchor.setTo(0.5, 0.5);

        //Cuando se clique por primera vez, se llama a la funcion onTap
        game.input.onDown.add(this.onTap, this);

        this.diamonds = [];
        for (var i = 0; i < amountDiamonds; i++) {
            var diamond = game.add.sprite(100, 100, 'diamonds');
            //Cambia el frame del sprite para que cambien los diamantes
            diamond.frame = game.rnd.integerInRange(0, 3);
            diamond.scale.setTo(0.30 + game.rnd.frac());
            diamond.anchor.setTo(0.5, 0.5);
            //Añadimos el diamante en una posición random
            diamond.x = game.rnd.integerInRange(50, 1050);
            diamond.y = game.rnd.integerInRange(50, 600);

            this.diamonds[i] = diamond;
            var rectCurrentDiamond = this.getBoundsDiamond(diamond);
            var rectHorse = this.getBoundsDiamond(this.horse);

            //Si se solapa con algun diamante...
            while (this.isOverlapingOtherDiamond(i, rectCurrentDiamond) || this.isRectangleOverlapping(rectHorse, rectCurrentDiamond)) {
                diamond.x = game.rnd.integerInRange(50, 1050);
                diamond.y = game.rnd.integerInRange(50, 600);
                rectCurrentDiamond = this.getBoundsDiamond(diamond);
            }
        }

        this.explosion = game.add.sprite(100, 100, 'explosion');
        //Un tween crea una animacion en un periodo de tiempo
        //game.add.tween(Medida a modificar)to(Datos a modificar, tiempo, tipo de animación, si arranca automaticamente, el delay, numero de repeticiones, modo yoyó)
        this.explosion.tweenScale = game.add.tween(this.explosion.scale).to({
            x: [0.4, 0.8, 0.4],
            y: [0.4, 0.8, 0.4]
        }, 600, Phaser.Easing.Exponential.Out, false, 0, 0, false);

        this.explosion.tweenAlpha = game.add.tween(this.explosion).to({
            alpha: [1, 0.6, 0]
        }, 600, Phaser.Easing.Exponential.Out, false, 0, 0, false);

        this.explosion.anchor.setTo(0.5, 0.5);
        this.explosion.visible = false;

    },
    onTap: function() {
        this.flagFirstMouseDown = !this.flagFirstMouseDown;
    },
    //Con esta funcion obtenemos las coordenadas de donde está situado y lo que mide el diamante
    getBoundsDiamond: function(currentDiamond) {
        return new Phaser.Rectangle(currentDiamond.left, currentDiamond.top, currentDiamond.width, currentDiamond.height);
    },
    //Si los rectangulos se solapan devuelve true
    isRectangleOverlapping: function(rect1, rect2) {
        if (rect1.x > rect2.x + rect2.width || rect2.x > rect1.x + rect1.width) {
            return false;
        }
        if (rect1.y > rect2.y + rect2.height || rect2.y > rect1.y + rect1.height) {
            return false;
        }
        return true;
    },
    //Mira en cada diamante ya creado si se solapa o no
    isOverlapingOtherDiamond: function(index, rect2) {
        for (var i = 0; i < index; i++) {
            var rect1 = this.getBoundsDiamond(this.diamonds[i]);
            if (this.isRectangleOverlapping(rect1, rect2)) {
                return true;
            }
        }
        return false
    },
    //Devuelve donde está el rectangulo del caballo
    getBoundsHorse: function() {
        var x0 = this.horse.x - Math.abs(this.horse.width) / 4; //Se divide entre 4 para que esté mas apurada la figura
        var horseWidth = Math.abs(this.horse.width) / 2;
        var y0 = this.horse.y - this.horse.height / 2;
        var horseHeight = this.horse.height;

        return new Phaser.Rectangle(x0, y0, horseWidth, horseHeight);
    },
    render: function() {
        // game.debug.spriteBounds(this.horse);
        // for (var i = 0; i < amountDiamonds; i++) {
        // 	game.debug.spriteBounds(this.diamonds[i]);
        // }
    },
    update: function() {
        if (this.flagFirstMouseDown) {
            //Coordenadas del puntero del ratón
            var pointerX = game.input.x;
            var pointerY = game.input.y;

            //Distancia entre el puntero y el caballo
            var distX = pointerX - this.horse.x;
            var distY = pointerY - this.horse.y;

            //Cambia la imagen del caballo dependiendo de hacia donde se dirija (izq o der)
            if (distX > 0) {
                this.horse.scale.setTo(1, 1);
            } else {
                this.horse.scale.setTo(-1, 1)
            }

            //Hace que el caballo se mueva, pero no tan rapido, si no que se mueva progresivamente
            this.horse.x += distX * 0.02;
            this.horse.y += distY * 0.02;

            //Por cada diamante en el mapa, comprueba si está tocando con el caballo
            for (var i = 0; i < amountDiamonds; i++) {
                var rectHorse = this.getBoundsHorse();
                var rectDiamond = this.getBoundsDiamond(this.diamonds[i]);
                if (this.diamonds[i].visible && this.isRectangleOverlapping(rectHorse, rectDiamond)) {
                    this.diamonds[i].visible = false;

                    this.explosion.x = this.diamonds[i].x;
                    this.explosion.y = this.diamonds[i].y;
                    this.explosion.visible = true;
                    this.explosion.tweenScale.start();
                    this.explosion.tweenAlpha.start();
                }
            }
        }




    },
}

var game = new Phaser.Game(1136, 640, Phaser.CANVAS);

game.state.add('gameplay', GamePlayManager);
game.state.start('gameplay');