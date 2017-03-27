$(function() {
    
    // Global var declarations
    
    var name;
    var gameID;
    var board = "big";
    var gameTree;
    var myPlayer;
    
    var database = firebase.database();
    
    var heading;
    var equation;
    var result;
    
    var turn = 1;
    var mode = "standby";
    
    var player1 = {
        x: 1,
        y: 1,
        direction: "E",
        health: 100
    }
    
    var player2 = {
        x: 14,
        y: 14,
        direction: "W",
        health: 100
    }
    
    $(".size").click(function() {
        $(".size").removeClass("active");
        $(this).addClass("active");
        board = $(this).attr("id");
    })
    
    $("#create button").click(function() {
        if( $("#name").val().length < 1 ) {
            $("#name").addClass("attn");
        } else {
            name = $("#name").val().toString();
            $("#name").removeClass("attn");
        }
    })
    
    $("#create input").blur(function() {
        if( $(this).val().length > 0 ) {
            $(this).removeClass("attn");
        }
    })
    
    $("#create_game").click(function() {
        if( $("#createID").val().length < 1 ) {
            $("#createID").addClass("attn");
        } else if( $("#name").val().length > 1 ) {
            gameID = $("#createID").val().toString().toLowerCase().trim();
            $("#createID").removeClass("attn");
            
            // Retrieve data tree with the Session ID name and if it is unique create new session
            return database.ref("/" + gameID).once('value').then(function(snapshot) {
                gameTree = snapshot.val();
                if ( gameTree == null ) {
                    database.ref("/" + gameID).update(
                        {
                            "player1": {
                                "direction": "E",
                                "equation": "",
                                "health": 100,
                                "name": name,
                                "result": "",
                                "x": 1,
                                "y": 1
                            },
                            "player2": {
                                "direction": "W",
                                "equation": "",
                                "health": 100,
                                "name": "",
                                "result": "",
                                "x": 14,
                                "y": 14
                            },
                            "shot": {
                                x: 0,
                                y: 0
                            },
                            "size": board,
                            "turn": 1
                        }
                    )
                    
                    myPlayer = 1;
                    transitionGame();
                    mode = "move";
                    heading = "E";
                    $("#E").addClass("sel");
                    
                } else {
                    alert("A session with this ID already exists, try searching for it and join it that way.");
                }
            });
        }
    })
    
    $("#findID").change(function() {
        $("#find_game").text("FIND GAME").removeClass("attn");
    });
    
    $("#find_game").click(function() {
        if( $(this).text() != "JOIN GAME" ) {
            if( $("#findID").val().length < 1 ) {
                $("#findID").addClass("attn");
            } else if( $("#name").val().length > 1 ) {
                gameID = $("#findID").val().toString().toLowerCase().trim();
                $("#findID").removeClass("attn");

                // Retrieve data tree with the Session ID name and if it exists, displays the information
                return database.ref("/" + gameID).once('value').then(function(snapshot) {
                    gameTree = snapshot.val();
                    if( gameTree != null ) {

                        if( gameTree.player2.name == "") {
                            $("#result_name").text(gameTree.player1.name);
                            $("#find_game").text("JOIN GAME").addClass("attn");
                            if( gameTree.size == "small" ) {
                                $("#result_size").text("8 × 8");
                            } else {
                                $("#result_size").text("16 × 16");
                            }
                        } else {
                            $("#result_name").text("Game Full");
                            $("#result_size").text("×");
                        }  

                    } else {
                        $("#result_name").text("No Result");
                        $("#result_size").text("×");
                    }
                });

            }
        } else {
            database.ref("/" + gameID + "/player2").update( { "name": name } )
            myPlayer = 2;
            transitionGame();
            mode = "standby";
            heading = "W";
            $("#W").addClass("sel");
        }
    })
    
    function transitionGame() {
        $("#welcome").hide()
        $("#game_board").show()
        return database.ref("/" + gameID).once('value').then(function(snapshot) {
            gameTree = snapshot.val();
            
            $("#name1 h2").text(gameTree.player1.name.toUpperCase());
            
            $("#name2 h2").text(gameTree.player2.name.toUpperCase());
            
            database.ref("/" + gameID + "/player2/name").on('value', function(snapshot) {  
                $("#name2 h2").text(snapshot.val().toUpperCase());
                if( myPlayer == 1 ) {
                    mode = "move";
                }
            })
            
            database.ref("/" + gameID + "/turn").on('value', function(snapshot) {  
                turn = snapshot.val();
            })
            
            database.ref("/" + gameID + "/player2/equation").on('value', function(snapshot) {  
                if( myPlayer == 2 ) {
                    mode = "standby";
                } else {
                    mode = "shoot";
                }
            })
            
            database.ref("/" + gameID + "/player1/equation").on('value', function(snapshot) {  
                if( myPlayer == 1 ) {
                    mode = "standby";
                } else {
                    mode = "shoot";
                }
            })
            
            database.ref("/" + gameID + "/player2").on('value', function(snapshot) {
                
                var dbPlayer2 = snapshot.val();
                
                player2.health = dbPlayer2.health;
                
                if( myPlayer == 2 ) {
                                        
                    player2.x = dbPlayer2.x;
                    player2.y = dbPlayer2.y;
                                        
                    mode = "standby";
                    
                } else {
                    
                    $("#enemyeq").text( dbPlayer2.equation );
                    $("#enemydir").text( dbPlayer2.direction.toUpperCase() );
                    player2.direction = dbPlayer2.direction.toUpperCase();
                                        
                    // Player1 SHOOTING
                    $("#grid td").click(function() {
                        if( turn == myPlayer && mode == "shoot") {
                                                        
                            player2.x = dbPlayer2.x;
                            player2.y = dbPlayer2.y; 
                                 
                            if( cursorX == dbPlayer2.x && cursorY == dbPlayer2.y ) {
                                setTimeout(function() {
                                    
                                    player2.health = player2.health - 10;
                                    
                                    database.ref("/" + gameID + "/player2").update( {
                                        "health": player2.health,
                                    });
                                    
                                }, 1000);
                            }
                            
                            setTimeout(function() {
                                mode = "move"
                            }, 100);
                        }
                    })
                }
                
                    
                
                    
                    
            })

            database.ref("/" + gameID + "/player1").on('value', function(snapshot) {
                
                var dbPlayer1 = snapshot.val();
                
                player1.health = dbPlayer1.health;
                
                if( myPlayer == 1 ) { 
                                        
                    player1.x = dbPlayer1.x;
                    player1.y = dbPlayer1.y;
                                        
                    mode = "standby";
                    
                } else {
                    
                    $("#enemyeq").text( dbPlayer1.equation );
                    $("#enemydir").text( dbPlayer1.direction.toUpperCase() );  
                    player1.direction = dbPlayer1.direction.toUpperCase();
                    
                    // Player2 SHOOTING
                    $("#grid td").click(function() {
                        if( turn == myPlayer && mode == "shoot") {
                                                        
                            player1.x = dbPlayer1.x;
                            player1.y = dbPlayer1.y;
                            
                            if( cursorX == dbPlayer1.x && cursorY == dbPlayer1.y ) {
                                setTimeout(function() {
                                    
                                    player1.health = player1.health - 10;
                                    
                                    database.ref("/" + gameID + "/player1").update( {
                                        "health": player1.health,
                                    });
                                    
                                }, 1000);
                            }
                                                        
                            setTimeout(function() {
                                mode = "move"
                            }, 100);
                            
                        }
                    }) 
                    
                }
                
                    
            })
            
        })
            
    }        
    
    $("#boatbox1").draggable();
    
    // Converts pixel coordinates to block coordinates specifically for Rameses (50x50)
    function pxToBlock(px) {
        if(rameses.direction == "E" || rameses.direction == "S") {
            return Math.ceil(px/30);
        } else {
            return Math.floor(px/30);
        }
    }

    // Converts pixel coordinatess to block coordinates using Math.floor()
    function pxToBlockFloor(px) {
        return Math.floor(px/30);
    }

    // Converts block coordinates to pixel coordinates
    function blockToPx(block) {
        return block*30;
    }
    
    var cursorX;
    var cursorY;
    
    $("#grid td").mouseenter(function() {
        cursorX = parseInt($(this).index());
        cursorY = parseInt($(this).parent().index());
    })
    
    
    $("#heading_container button").click(function() {
        $("#heading_container button").removeClass("sel");
        $(this).addClass("sel");
        heading = $(this).attr("id").toUpperCase();
        if( myPlayer == 1 ) {
            player1.direction = heading;
        } else {
            player2.direction = heading;
        }
    });
    
    $("#submit").click(function() {
        if( $("#result").val().length > 0 && $("#result").val() != "NaN" && turn == myPlayer && mode == "move" ) {
                
            
            return database.ref("/" + gameID).once('value').then(function(snapshot) {
                
                gameTree = snapshot.val();
                
                var lastEq;  
                if( myPlayer == 1 ) {
                    lastEq = gameTree.player1.equation;
                } else {
                    lastEq = gameTree.player2.equation;
                }
                
                var newX;
                var newY;
                
                if( equation != lastEq ) {
                    
                    if( myPlayer==1 ) {
                        
                        if(heading == "N") {
                            newY = player1.y - result;
                            newX = player1.x;
                        }
                        if(heading == "S") {
                            newY = player1.y - result*-1;
                            newX = player1.x;
                        }
                        if(heading == "E") {
                            newX = player1.x - result*-1;
                            newY = player1.y;
                        }
                        if(heading == "W") {
                            newX = player1.x - result;
                            newY = player1.y;
                        }
                        
                        if( newX > 15) {
                            newX = 15;
                        } else if( newX < 0) {
                            newX = 0;
                        }

                        if( newY > 15) {
                            newY = 15;
                        } else if( newY < 0) {
                            newY = 0;
                        }
                        
                        database.ref("/" + gameID).update( { "turn": 2 } );
                        
                        database.ref("/" + gameID + "/player1").update( {
                            "direction": heading,
                            "equation": equation,
                            "result": result,
                            "x": newX,
                            "y": newY
                        });
                        
                    } else {
                        
                        if(heading == "N") {
                            newY = player2.y - result;
                            newX = player2.x;
                        }
                        if(heading == "S") {
                            newY = player2.y - result*-1;
                            newX = player2.x;
                        }
                        if(heading == "E") {
                            newX = player2.x - result*-1;
                            newY = player2.y;
                        }
                        if(heading == "W") {
                            newX = player2.x - result;
                            newY = player2.y;
                        }
                        
                        if( newX > 15) {
                            newX = 15;
                        } else if( newX < 0) {
                            newX = 0;
                        }

                        if( newY > 15) {
                            newY = 15;
                        } else if( newY < 0) {
                            newY = 0;
                        }
                        
                        database.ref("/" + gameID).update( { "turn": 1 } );
                        
                        database.ref("/" + gameID + "/player2").update( {
                            "direction": heading,
                            "equation": equation,
                            "health": player2.health,
                            "result": result,
                            "x": newX,
                            "y": newY
                        });
                    }
                    
                    $("#equation").val("");
                    $("#result").val("");
                    
                } else {
                    alert("Equation cannot be the same as the last submitted!");
                }
            });
            
            
                    
        }
    })
    
    $("#debug").draggable({
        scroll: false,
        containment: "body"
    });
    
    setInterval(update, 33.33);
    
    function update() {    
        
        $("#boat1").css("top", $("#boatbox1").css("top")).css("left", $("#boatbox1").css("left"));
        $("#boat2").css("top", $("#boatbox2").css("top")).css("left", $("#boatbox2").css("left"));
        
        equation = $("#equation").val();
        result = Math.round(math.eval( $("#equation").val() ));
        $("#result").val(result);
        
        
        if( mode == "standby" || mode == "shoot" ) {
            $("#equation").prop('disabled', true);
        } else {
            $("#equation").prop('disabled', false);
        }
        
        if( mode == "standby" ) {
            $("#mode_frame").css("transform", "rotate(40deg)");
        } else if( mode == "shoot" ) {
            $("#mode_frame").css("transform", "rotate(0deg)");
        } else if( mode == "move" ) {
            $("#mode_frame").css("transform", "rotate(-40deg)");
        }
        
        
        if( turn == 1 ) {
            $("#indicator1").show();
            $("#indicator2").hide();
        } else {
            $("#indicator2").show();
            $("#indicator1").hide();
        }
        
        $("#name1 .health_progress").css("width", player1.health + "%");
        $("#name2 .health_progress").css("width", player2.health + "%");
        
        $("#debug_cx").text("cursor x: " + cursorX);
        $("#debug_cy").text("cursor y: " + cursorY);
        
        $("#debug_mode").text("mode: " + mode);
        $("#debug_1x").text("player1 x: " + player1.x);
        $("#debug_1y").text("player1 y: " + player1.y);
        $("#debug_1dir").text("player1 direction: " + player1.direction);
        
        
        $("#debug_2x").text("player2 x: " + player2.x);
        $("#debug_2y").text("player2 y: " + player2.y);
        $("#debug_2dir").text("player2 direction: " + player2.direction);
        
        
        if( $("#name2 h2").text().length < 1 ) {
            $("#name2 h2").text("WAITING FOR PLAYER 2");
        }
        
        if( $("#enemyeq").text().length < 1 ) {
            $("#enemyeq").text("-");
        }
        
        if( myPlayer == 1 ) {
            $("#name1 h2").css("color", "#ffd700");
            $("#name2 h2").css("color", "#fff");
        } else {
            $("#name1 h2").css("color", "#fff");
            $("#name2 h2").css("color", "#ffd700");
        }
        
        if( player1.health < 0) {
            player1.health = 0
        }
        
        if( player2.health < 0) {
            player2.health = 0
        }
        
        if( player1.x > 15) {
            player1.x = 15;
        } else if( player1.x < 0) {
            player1.x = 0;
        }
        
        if( player1.y > 15) {
            player1.y = 15;
        } else if( player1.y < 0) {
            player1.y = 0;
        }
        
        if( player2.x > 15) {
            player2.x = 15;
        } else if( player2.x < 0) {
            player2.x = 0;
        }
        
        if( player2.y > 15) {
            player2.y = 15;
        } else if( player2.y < 0) {
            player2.y = 0;
        }
        
        $("#boat2").css("background-image", "url(img/ship" + player2.direction.toLowerCase() + "256.png)");
        $("#boat1").css("background-image", "url(img/ship" + player1.direction.toLowerCase() + "256.png)");
        
        $("#boatbox1").css( "top", blockToPx( player1.y ) );
        $("#boatbox1").css( "left", blockToPx( player1.x ) );
        
        $("#boatbox2").css( "top", blockToPx( player2.y ) );
        $("#boatbox2").css( "left", blockToPx( player2.x ) );
    
    }
    
})