const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;
const xml2js = require('xml2js');
// const parser = new DOMParser();
const bodyParser = require('body-parser');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));

// Set EJS as the templating engine
app.set('view engine', 'ejs');

app.set('views', './views');

// Create a route to fetch data and render HTML
app.post('/submit', async (req, res) => {
  const query = req.body.query;

  try {
    const response = await axios.get(`https://librivox.org/api/feed/audiobooks/title/%5E${query}?format=json/`);

    if (!response.data || !Array.isArray(response.data.books)) {
      throw new Error('Invalid data format');
    }
    // console.log(response.data)
    const audiobooks = response.data.books;
    res.render('index', { audiobooks });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).send('No book was found');
  }
  
});


app.get('/', async (req, res) => {
  res.render('search');
});




app.get('/audio', async (req, res) => {
  const link = req.query.link;
  try {
    const response = await axios.get(`${link}/?format=json`);
    if (!response.data) {
        throw new Error('Invalid data format');
      }
    
    //   console.log(response.data);
      const p = response.data
    const parseXml = async (p) => {
        return new Promise((resolve, reject) => {
          const parser = new xml2js.Parser();
          parser.parseString(p, (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          });
        });
      };


      try {
        const dom = await parseXml(p);
        // console.log(dom.rss.channel[0])
        let items = dom.rss.channel[0].item
        let image = dom.rss.channel[0]['itunes:image'][0]['$'].href

        let title = dom.rss.channel[0].title[0]
        // console.log(title)
        res.render('audio', { items, image,title});

        
      } catch (error) {
        console.error('Error:', error);
      }

      
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).send('Something went wrong');
  }
});
// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port} on http://localhost:3000`);
});
