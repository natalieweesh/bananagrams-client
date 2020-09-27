import React from 'react';
import './Rules.css';

const Rules = () => {
  
  return (
    <div className="instructions">
      <h3>🍌 How to play! 🍌</h3>
      <p>You start the game with all the tiles shuffled in the center</p>
      <p>Each player will have their designated area (yellow rectangle) to arrange their tiles</p>
      <p>Depending on how many players there are, you should each start with this many tiles:</p>
      <table>
        <tr>
          <td>Players</td><td>2-4</td><td>5-6</td><td>7-8</td>
        </tr>
        <tr><td>Starting tiles</td><td>21</td><td>15</td><td>11</td></tr>
      </table>
      <p>Once everyone has their tiles, everyone says SPLIT! and turns over their tiles and starts the game</p>
      <p>(Someone should press the SPLIT button)</p>
      <p>Now try to form a crossword puzzle with your letters</p>
      <p>Whenever you have completed your crossword with valid words, you say PEEL! and take another letter from the central square</p>
      <p>Then you'll have to fit that new letter into your crossword</p>
      <p>At any point during the game you may put a letter back that you don't want, but you have to say DUMP! and take three new letters instead</p>
      <p>When there are not enough tiles left in the center for everyone to grab another one, then whoever completes their crossword first yells BANANAS! and wins the game</p>
      <p></p>
      <p>These are the tile counts:</p>
      <table>
        <tr>
          <td>A = 13</td>
          <td>B = 3</td>
          <td>C = 3</td>
          <td>D = 6</td>
          <td>E = 18</td>
          <td>F = 3</td>
        </tr><tr>
          <td>G = 4</td>
          <td>H = 3</td>
          <td>I = 12</td>
          <td>J = 2</td>
          <td>K = 2</td>
          <td>L = 5</td>
        </tr><tr>
          <td>M = 3</td>
          <td>N = 8</td>
          <td>O = 11</td>
          <td>P = 3</td>
          <td>Q = 2</td>
          <td>R = 9</td>
        </tr><tr>
          <td>S = 6</td>
          <td>T = 9</td>
          <td>U = 6</td>
          <td>V = 3</td>
          <td>W = 3</td>
          <td>X = 2</td>
        </tr><tr>
          <td>Y = 3</td>
          <td>Z = 2</td>
        </tr>
      </table>
    </div>
  )
};

export default Rules;