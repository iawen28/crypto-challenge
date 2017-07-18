import React, { Component } from 'react';
import axios from 'axios';

import { Card, CardTitle, CardActions } from 'react-toolbox/lib/card';
import { Button } from 'react-toolbox/lib/button';
import Avatar from 'react-toolbox/lib/avatar';
import Input from 'react-toolbox/lib/input';
import DatePicker from 'react-toolbox/lib/date_picker';
import Dialog from 'react-toolbox/lib/dialog';
// import Tooltip from 'react-toolbox/lib/tooltip';
// import Link from 'react-toolbox/lib/link';
// const TooltipLink = Tooltip(Link);
// webpack config must not be totally right, missing some styles, had to get creative w copy message

const CryptoJS = require('crypto-js');

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sender: '',
      message: '',
      date: '',
      encMessage: '',
      active: false,
      passcode: '',
      disp: 0,
      copyMessage: 'Click to copy to clipboard'
    };
    this.handleToggle = this.handleToggle.bind(this);
    this.changePasscode = this.changePasscode.bind(this);
    this.codeHover = this.codeHover.bind(this);
    this.noHover = this.noHover.bind(this);
    this.copyText = this.copyText.bind(this);
    this.encrypt = this.encrypt.bind(this);
    this.encryptDisplay = this.encryptDisplay.bind(this);
    this.decryptDisplay = this.decryptDisplay.bind(this);
    this.decrypt = this.decrypt.bind(this);
  }

  componentWillMount() {
    this.changePasscode();
  }

  handleChange(name, value) {
    this.setState({ ...this.state, [name]: value });
  }

  handleToggle() {
    this.setState({ active: !this.state.active });
  }

  changePasscode() {
    let code = '';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz000111222333444555666777888999';
    for (let i = 0; i < 5; i += 1) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.setState({ passcode: code });
  }

  codeHover() {
    this.setState({ disp: 1 });
  }

  noHover() {
    this.setState({ disp: 0 });
  }

  copyText() {
    const text = document.querySelector('#pass');
    const range = document.createRange();
    range.selectNodeContents(text);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    document.execCommand('Copy');
    if (document.execCommand('Copy') === true) {
      this.setState({ copyMessage: 'Passphrase copied!' });
      const resetCM = () => {
        this.setState({ copyMessage: 'Click to copy to clipboard' });
      };
      setTimeout(resetCM, 1500);
    }
    selection.removeAllRanges();
  }

  encrypt() {
    this.handleToggle();
    const origMessage = this.state.message;
    if (origMessage.length > 0) {
      const key = this.state.passcode;
      const ciphertext = CryptoJS.AES.encrypt(origMessage, key);
      const encMessage = ciphertext.toString();
      this.setState({ encMessage });
      const that = this;
      axios.post('/api/cryptation', {
        sender: this.state.sender,
        encMessage,
        expiration: this.state.date
      }).then((res) => {
        console.log('Encryption saved', res.data);
        that.setState({ sender: '', message: '', date: '' });
      }).catch(err => console.log(err));
    }
  }

  encryptDisplay() {
    this.handleToggle();
    this.setState({ encMessage: '' });
  }

  decryptDisplay() {
    this.handleToggle();
    this.setState({ encMessage: '' });
  }

  decrypt() {
    this.setState({ message: '', sender: '', date: '' });
    const encMessage = this.state.encMessage;
    let sender;
    let index;
    // get url endpoint for key
    const url = window.location.href;
    const arr = url.toString().split('#');
    const key = arr[arr.length - 1];
    if (key.length !== 5) {
      this.setState({ message: 'Sender\'s five-character passphrase must be after localhost:3000/#' });
      this.handleToggle();
      return;
    }
    if (encMessage.length > 0) {
      const that = this;
      axios.get('/api/cryptation').then((res) => {
        // find matching encrypted message in db
        for (let i = 0; i < res.data.length; i += 1) {
          if (encMessage === res.data[i].encMessage) {
            index = i;
            sender = res.data[i].sender;
            i = res.data.length;
          }
        }
        if (index === undefined) {
          that.setState({ message: 'Invalid encrypted message' });
          return;
        }
        if (res.data[index].expiration) {
          // compare current date with expiration date
          const date1 = new Date();
          let month = date1.getMonth() + 1;
          let day = date1.getDate();
          const year = date1.getFullYear();
          if (month < 10) month = '0' + month;
          if (day < 10) day = '0' + day;
          const currDate = [year, month, day].join('');
          const date2 = res.data[index].expiration;
          const exDate = date2.substring(0, 10).replace(/(?!\w)./g, '');
          if (Number(exDate) < Number(currDate)) {
            that.setState({ message: 'Message has expired' });
            return;
          }
        }
        // decrpyt with sender's passphrase from url as key
        const bytes = CryptoJS.AES.decrypt(encMessage, key);
        const origMessage = bytes.toString(CryptoJS.enc.Utf8);
        if (origMessage.length < 1) {
          // they must have the wrong key/passphrase
          that.setState({ message: 'Invalid encrypted message', encMessage: '' });
        } else {
          // we got a message using the key and encMessage combo
          that.setState({ message: origMessage, encMessage: '', sender });
        }
      });
    }
    this.handleToggle();
  }

  render() {
    return (
      <div>
        <Card style={{ width: 350, marginLeft: 'auto', marginRight: 'auto', padding: '0px 14px' }}>
          <CardTitle title="Enigma" style={{ marginLeft: -14 }} />
          <CardTitle
            style={{ marginLeft: -14 }}
            avatar={<Avatar title={this.state.sender || 'N'} />}
          >
            <Input
              type="text"
              label="Name"
              name="sender"
              value={this.state.sender}
              required
              onChange={ this.handleChange.bind(this, 'sender') }
            />
          </CardTitle>
          <Input
            type="text"
            hint="Type your secret message here"
            label="Message"
            name="message"
            value={this.state.message}
            required
            maxLength={120}
            multiline
            rows={2}
            onChange={this.handleChange.bind(this, 'message')}
          />
          <DatePicker
            label="Expiration date"
            onChange={this.handleChange.bind(this, 'date')}
            value={this.state.date}
            sundayFirstDayOfWeek
          />
          <CardActions style={{ marginLeft: -14 }}>
            <Button label="Encrypt" onClick={this.encrypt} />
            <Button label="Decrypt" onClick={this.decryptDisplay} />
            <Dialog
              title="De/Encrypt"
              active={this.state.active}
              actions={[{ label: 'Close', onClick: this.encryptDisplay }, { label: 'Decrypt', onClick: this.decrypt }]}
            >
              <Input
                type="text"
                label="Message"
                multiline={true}
                name="encMessage"
                value={this.state.encMessage}
                required
                onChange={this.handleChange.bind(this, 'encMessage')}
              />
            </Dialog>
          </CardActions>
        </Card>

        <div style={{ height: 12 }} />
        <div style={{
          width: 150,
          marginLeft: '52%',
          marginTop: -20,
          fontFamily: 'Helvetica Neue, Helvetica, Arial',
          fontSize: 12,
          backgroundColor: 'gray',
          color: 'white',
          textAlign: 'center',
          padding: 7,
          borderRadius: 3,
          opacity: this.state.disp
        }}
        >{this.state.copyMessage}</div>
        <div style={{ fontFamily: 'Helvetica Neue, Helvetica, Arial', fontSize: 13, textAlign: 'center' }}>
          <span>Your Passphrase - </span>
          <a id="pass" style={{ color: 'blue' }}
            onClick={this.copyText}
            onMouseOver={this.codeHover}
            onMouseOut={this.noHover}
          >{this.state.passcode}</a>
          <div style={{ height: 18 }} />
          <a style={{ color: 'blue'}} onClick={this.changePasscode}>Generate New Passphrase</a>
        </div>
      </div>
    );
  }
}

export default App;
