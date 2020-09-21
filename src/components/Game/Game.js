import React, { useState, useEffect, useRef } from 'react';
import queryString from 'query-string';
import io from 'socket.io-client';
import Draggable from 'draggable';
import { tiles } from './tiles';
import Rules from '../Rules/Rules';
import TextContainer from '../TextContainer/TextContainer';
import './Game.css';

let socket;

const Game = ({ location }) => {
  const [name, setName] = useState('');
  const [room, setRoom] = useState('');
  const [prevmessages, setPrevMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentGame, setCurrentGame] = useState([]);
  const [newRound, setNewRound] = useState(false);
  const [finishedGame, setFinishedGame] = useState(false);
  const [gameSplit, setGameSplit] = useState(false);
  const [poop, setPoop] = useState(false);
  const [cards, setCards] = useState(tiles["tiles"]);
  const draggables = useRef([]);
  const [modal, setModal] = useState('');

  // TODO: change this for prod / dev
  // const ENDPOINT = 'localhost:5000';
  const ENDPOINT = 'https://bananagrams-app.herokuapp.com/';

  const setTileClass = (x, y, user, tile, animate) => {
    let className;
    let tileId = tile.element.id;
    if (x > 1000 && x < 1700 && y > 1120 && y < 1920 && user) {
      // console.log("in no mans land", x, y, user)
      className = 'item poop';
    } else {
      className = 'item';
    }
    document.getElementById(tileId).className = className;
  }

  useEffect(() => {
    const { name, room } = queryString.parse(location.search);

    socket = io(ENDPOINT);

    setName(name.trim().toLowerCase());
    setRoom(room.trim().toLowerCase());

    socket.emit('join', { name, room }, ((e) => {
      if (e) {
        window.location.href='/';
        alert(e)
      }
    }));

    return () => {
      socket.emit('disconnect');

      socket.off();
    }

  }, [ENDPOINT, location.search]);

  useEffect(() => {
    socket.off('roomData').on('roomData', ({ users }) => {
      console.log('Room Data', users)
      setUsers(users);
    })
    socket.off('gameStatus').on('gameStatus', ({ game }) => {
      // console.log('Game Status', game);
      if (game && game.cards.length > 0) {
        setCards(game.cards);
        // console.log('setting locations from memory')
        game.cards.forEach((card) => {
          if (card.x && card.y) {
            let tile = draggables.current.find((d) => d.element.id === card.id);
            tile.set(card.x, card.y);
            setTileClass(card.x, card.y, card.user, tile, false, false);
          }
        })
      }

      if (currentGame.length === 0 && !!game) {
        setCurrentGame(game);
        if (newRound !== game.newRound) {
          setNewRound(game.newRound)
        }
        setFinishedGame(game.finishedGame)
        setGameSplit(game.split)
      }
    })
    socket.off('gameRestarted').on('gameRestarted', ({ users }) => {
      setFinishedGame(false)
      setGameSplit(false)
      setNewRound(false)
      setUsers(users);
      setCurrentGame([])
      setCards(tiles["tiles"])
      draggables.current.forEach((d) => {
        const randX = 1000 + Math.floor(Math.random() * 650);
        const randY = 1230 + Math.floor(Math.random() * 645);
        d.set(randX, randY);
        document.getElementById(d.element.id).className = 'item poop';
      })
    })
    socket.off('tileMoved').on('tileMoved', ({el, x, y, user, settingUp}) => {
      // console.log('received tilemoved', el, x, y, user);
      const tile = draggables.current.filter((e) => e.element.id === el)[0];
      setTileClass(x, y, user, tile, true);
      tile.set(x, y);
    })

    document.querySelectorAll('.item').forEach((el) => {
      draggables.current.push(new Draggable(el, {onDragEnd: (el, x, y, event) => {
        socket.emit('moveTile', {el: el.id, x, y, settingUp: false}, () => {
          // console.log('tile moved on Drag End!', el.id, x, y);
        })
      }}));
    })
    // scatter the tiles!
    draggables.current.forEach((d) => {
      const randX = 1000 + Math.floor(Math.random() * 650);
      const randY = 1230 + Math.floor(Math.random() * 645);
      d.set(randX, randY);
    })
    // console.log('dragagbles are now', draggables.current)
  }, [])

  useEffect(() => {
    socket.off('disconnect').on('disconnect', () => {
      // if(!alert('ack! you have been disconnected!')){window.location.reload();}
      // if(!alert('ack youve been disconnected')){setPoop(true)}
      setPoop(true);
      const reconnectFrontEnd = () => {
        const { name, room } = queryString.parse(location.search);
        socket.connect()
        socket.emit('frontEndReconnect', {name, room}, () => {
        })
        socket.emit('join', { name, room }, ((e) => {
          if (e) {
            window.location.href='/';
            alert(e)
          }
        }));
        document.removeEventListener('click', reconnectFrontEnd)
        document.removeEventListener('visibilitychange', reconnectFrontEndVisible);
      }
      document.addEventListener('click', reconnectFrontEnd)

      const reconnectFrontEndVisible = () => {
        const { name, room } = queryString.parse(location.search);
        if (document.visibilityState && document.visibilityState === 'visible') {
          socket.connect()
          socket.emit('frontEndReconnect', {name, room}, () => {
          })
          socket.emit('join', { name, room }, ((e) => {
            if (e) {
              window.location.href='/';
              alert(e)
            }
            document.removeEventListener('visibilitychange', reconnectFrontEndVisible);
          })); 
          document.removeEventListener('visibilitychange', reconnectFrontEndVisible);
          document.removeEventListener('click', reconnectFrontEnd)
        }
      }
      document.addEventListener('visibilitychange', reconnectFrontEndVisible)
    })
  })

  useEffect(() => {
    socket.off('message').on('message', ({user, message, messages}) => {
      if (message && prevmessages) {
        setPrevMessages([...prevmessages, {user, text: message}]);
      } else if (message && messages) {
        setPrevMessages([...messages, {user, text: message}]);
      }
    })
  }, [prevmessages])

  useEffect(() => {
    socket.off('startGame').on('startGame', ({ users }) => {
      socket.emit('initiateGame', {cards: tiles["tiles"]}, () => {
        socket.emit('fetchGame', () => {
        })
      })
    })
  }, [currentGame, setCurrentGame])


  const updateUserStatus = (event) => {
    event.preventDefault();

    socket.emit('setReadyToPlay', () => {
    })
  }

  const userRestart = (event) => {
    event.preventDefault();

    socket.emit('setReadyToRestart', {cards: tiles["tiles"]}, () => {
    })
  }

  const startingTiles = (num) => {
    if (num < 5) {
      return 21;
    } else if (num < 7) {
      return 15;
    } else {
      return 11;
    }
  }

  const user = users.find((user) => user.name === name);
  // console.log("USER", user);
  console.log('current game', currentGame)
  const myTurn = currentGame.currentRound === user?.orderIndex;
  // console.log('my turn?', myTurn)
  return (
    <div className={`player-${user?.orderIndex} outerContainer ${currentGame.finishedGame && 'revealAll'} ${!currentGame.split && 'notSplit'}`}>
      <div className="sideContainer">
        {poop ? <div className="modal"><div className="attentionModal">Hey! Pay attention to the game!<button className="button" onClick={() => {setPoop(false)}}>Ok</button></div></div> : null}
        <div className="users-list">
          {(currentGame.length === 0 || finishedGame) && <TextContainer users={users} user={user} game={currentGame} finishedGame={finishedGame} />}
          {currentGame.length === 0 && users.length > 1 && <button className="startButton" disabled={user?.readyToPlay} onClick={updateUserStatus}>{user?.readyToPlay ? 'Waiting for other players' : 'Ready to play!'}</button>}
          {finishedGame && <div><button className="startButton" disabled={user?.readyToRestart} onClick={userRestart}>{user?.readyToRestart ? 'Waiting for other players' : 'Play again!'}</button></div>}
        </div>
        {currentGame.length !== 0 && (
          <>
          {!finishedGame && <>
          {!currentGame.split && <button className="button tips" onClick={() => {
            socket.emit('splitIt', () => {
            })
          }}>SPLIT!<br/>(only click when everyone has their tiles ready)</button>}
          <p className="tips inverse">Each player should start with {users && startingTiles(users.length)} tiles!</p>
          <button className="endGame" onClick={() => {
            const endIt = window.confirm('Are you sure you want to end the game?');
            if (endIt) {
              socket.emit('showAllTiles', () => {
                // console.log('now show all tiles')
              })
            }
          }}>Click here to end the game and reveal all the tiles!</button></>}
          </>
        )}
        <button className="rulesButton" onClick={() => setModal('rules')}>Check the rule book</button>
        {modal && <div className="modal">
          <button className="button closeModal" onClick={(e) => {
            e.preventDefault();
            setModal('');
          }}>X</button>
          {modal === 'rules' && <Rules />}
          
        </div>}
      </div>
      <div className="mah-jong-board">
      <div className="second-row">
        <div className="player-space player-4">
          {users.length > 4 && <p>Player five: {users[4].name}</p>}
        </div>
        <div className="player-space player-0">
          {users.length > 0 && <p>Player one: {users[0].name}</p>}
        </div>
        <div className="player-space player-5">
          {users.length > 5 && <p>Player six: {users[5].name}</p>}
        </div>
      </div>
      <div className="second-row">
      <div className="player-space player-1">
        {users.length > 1 && <p>Player two: {users[1].name}</p>}
      </div>
      <div className="square dropzone">
        {cards.map((t) => <p className="item poop" id={t.id}>{t.letter}</p>)}
      </div>
      <div className="player-space player-2">
        {users.length > 2 && <p>Player three: {users[2].name}</p>}
      </div>
      </div>
      <div className="second-row">
        <div className="player-space player-6">
          {users.length > 6 && <p>Player seven: {users[6].name}</p>}
        </div>
        <div className="player-space player-3">
          {users.length > 3 && <p>Player four: {users[3].name}</p>}
        </div>
        <div className="player-space player-7">
          {users.length > 7 && <p>Player eight: {users[7].name}</p>}
        </div>
      </div>
      </div>
    </div>
  )   
}

export default Game;