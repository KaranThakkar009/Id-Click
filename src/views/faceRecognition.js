import React, { Component } from 'react';
import axios from 'axios';
import OnlyDesc from '../components/onlyDescriptors/onlyDescriptors';
import { withRouter } from 'react-router-dom';
import {
  loadModels,
  getFullFaceDescription,
  createMatcher,
  isFaceDetectionModelLoaded
} from '../api/face';
import DrawBox from '../components/drawBox';
import ShowDescriptors from '../components/showDescriptors';
import { JSON_PROFILE } from '../common/profile';


const MaxWidth = 600;
const boxColor = '#BE80B5';
const testImg = require('../img/Mark1.jpg');

let INIT_STATE = {
  url: null,
  imageURL: null,
  fullDesc: null,
  imageDimension: null,
  error: null,
  loading: false
};


class FaceRecognition extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ...INIT_STATE,
      faceMatcher: null,
      showDescriptors: false,
      WIDTH: null,
      HEIGHT: 0,
      isModelLoaded: !!isFaceDetectionModelLoaded()
    };
  }



  componentWillMount() {
    this.resetState();
    let _W = document.documentElement.clientWidth;
    if (_W > MaxWidth) _W = MaxWidth;
    this.setState({ WIDTH: _W });
    this.mounting();
  }

  mounting = async () => {
    await loadModels();
    await this.matcher();
    await this.getImageDimension(testImg);
    await this.setState({ imageURL: testImg, loading: true });
    await this.handleImageChange(testImg);
  };

  matcher = async () => {
    const faceMatcher = await createMatcher(JSON_PROFILE);
    this.setState({ faceMatcher });
    // console.log(faceMatcher._labeledDescriptors[0]._label)
    // console.log(faceMatcher)
  };

  handleFileChange = async event => {
    this.resetState();
    await this.setState({
      imageURL: URL.createObjectURL(event.target.files[0]),
      loading: true
    });
    this.handleImageChange();
  };

  handleURLChange = event => {
    this.setState({ url: event.target.value });
  };

  handleButtonClick = async () => {
    this.resetState();
    let blob = await fetch(this.state.url)
      .then(r => r.blob())
      .catch(error => this.setState({ error }));
    if (!!blob && blob.type.includes('image')) {
      this.setState({
        imageURL: URL.createObjectURL(blob),
        loading: true
      });
      this.handleImageChange();
    }
  };

  sendMessage = (message) => {
   // console.log(this.refs.UserName.value, message)
   const waMsg = {
    "msg" : message,
  }
  const URL= 'http://localhost:5000/message'
  axios.post(URL, waMsg)
    .then(response => {
      //console.log(response);
    });
    this.refs.message.value = "";
    }


  addUserPost = (UserName, Desc) => {
    var element = []
    for (let index = 0; index < Desc.props.fullDesc[0]._descriptor.length; index++) {
      element.push(Desc.props.fullDesc[0]._descriptor[index]);
    }
    if (UserName && Desc) {
      var newUser = {
        "name": UserName,
        "descriptors": [element]
      };
      //console.log(newUser.descriptors)
    }
    let mergeData = [newUser];
    //console.log(mergeData[0].descriptors)
    this.saveUserJson(mergeData);
    element = []
    alert("Your data is saved")
    //console.log(element)

  }

  saveUserJson = (User) => {
    const url = 'http://localhost:5000/write'
    axios.post(url, User)
      .then(response => {
        //console.log(response);
      });
  }

  handleImageChange = async (image = this.state.imageURL) => {
    await this.getImageDimension(image);
    await getFullFaceDescription(image).then(fullDesc => {
      this.setState({ fullDesc, loading: false });
    });
  };

  getImageDimension = imageURL => {
    let img = new Image();
    img.onload = () => {
      let HEIGHT = (this.state.WIDTH * img.height) / img.width;
      this.setState({
        HEIGHT,
        imageDimension: {
          width: img.width,
          height: img.height
        }
      });
    };
    img.src = imageURL;
  };

  handleDescriptorsCheck = event => {
    this.setState({ showDescriptors: event.target.checked });

  };

  resetState = () => {
    this.setState({ ...INIT_STATE });
  };
  render() {
    const {
      WIDTH,
      HEIGHT,
      imageURL,
      fullDesc,
      faceMatcher,
      showDescriptors,
      isModelLoaded,
      error,
      loading

    } = this.state;

    // Display working status
    let status = <p>Status: Model Loaded = {isModelLoaded.toString()}</p>;
    if (!!error && error.toString() === 'TypeError: Failed to fetch') {
      status = (
        <p style={{ color: 'red' }}>Status: Error Failed to fetch Image URL</p>
      );
    } else if (loading) {
      status = <p style={{ color: 'blue' }}>Status: LOADING...</p>;
    } else if (!!fullDesc && !!imageURL && !loading) {
      if (fullDesc.length < 2)
        status = <p>Status: {fullDesc.length} Face Detect</p>;
      if (fullDesc.length > 1)
        status = <p>Status: {fullDesc.length} Faces Detect</p>;
    }
    // Loading Spinner
    let spinner = (
      <div
        style={{
          margin: 0,
          color: '#BE80B5',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%,-50%)',
          textShadow: '2px 2px 3px #fff'
        }}
      >
        <div className="loading" />
        <h3>Processing...</h3>
      </div>
    );

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        {status}
        <div
          style={{
            position: 'relative',
            width: WIDTH,
            height: HEIGHT
          }}
        >
          {!!imageURL ? (
            <div
              style={{
                position: 'relative'
              }}
            >
              <div style={{ position: 'absolute' }}>
                <img style={{ width: WIDTH }} src={imageURL} alt="imageURL" />
              </div>
              {!!fullDesc ? (
                <DrawBox
                  fullDesc={fullDesc}
                  faceMatcher={faceMatcher}
                  imageWidth={WIDTH}
                  boxColor={boxColor}
                />
              ) : null}
            </div>
          ) : null}
           
          {loading ? spinner : null}
        </div>
        <div
          style={{
            width: WIDTH,
            padding: 10,
            border: 'solid',
            marginTop: 10
          }}
        >
          <p>Input Image file</p>
          <input
            id="myFileUpload"
            type="file"
            onChange={this.handleFileChange}
            accept=".jpg, .jpeg, .png"
          />

          <p>Enter name:</p>
          <input type="text" ref="UserName" placeholder="Enter Name" />
          <button onClick={() => this.addUserPost(this.refs.UserName.value,
            <OnlyDesc fullDesc={fullDesc} />)}>Upload</button>
          <br /><br />
          <input type="text" ref="message" placeholder="Enter Message" />
          <button onClick={() => this.sendMessage(this.refs.message.value)}>Send Message</button>
          <br />
          {/* <div className="URLInput">
            <input
              type="url"
              name="url"
              id="url"
              placeholder="Place your photo URL here (only .jpg, .jpeg, .png)"
              pattern="https://.*"
              size="30"
              onChange={this.handleURLChange}
            />
            <button onClick={this.handleButtonClick}>Upload</button>
          </div> */}
          <div>
            <input
              name="descriptors"
              type="checkbox"
              checked={this.state.showDescriptors}
              onChange={this.handleDescriptorsCheck}
            />
            <label>Show Descriptors</label>
          </div>
          {!!showDescriptors ? <ShowDescriptors fullDesc={fullDesc} /> : null}
          {/* {!!showDescriptors ? <OnlyDesc fullDesc={fullDesc} /> : null} */}

        </div>
      </div>
    );
  }
}

export default withRouter(FaceRecognition);
