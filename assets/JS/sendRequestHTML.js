const sendRequestHTML = (actionString) =>{
    const myHTML = `
<html>
  <body>
    <h1>${actionString}</h1>
  </body>
</html>`;

  return myHTML
}

module.exports = sendRequestHTML