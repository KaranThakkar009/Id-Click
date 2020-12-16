import React, { Component } from 'react';

class OnlyDesc extends Component {
  constructor(props) {
    super(props);
    this.state = {
      descriptors: null
    };
  }

  componentWillMount() {
    this.update();
  }

  componentWillReceiveProps(newProps) {
    this.update(newProps);
  }

  update = (props = this.props) => {
    let { fullDesc } = props;
    if (!!fullDesc) {
      this.setState({
        descriptors: fullDesc.map(fd => fd.descriptor)
      });
    }
  };

  render() {
    const { descriptors } = this.state;

    return (
      
      <div>
        {!!descriptors
          ? descriptors.map((descriptor,i) => (
              <p key={i} >
                {descriptor.toString()}
              </p>
            ))
          : null}
      </div>
    );
  }
}

export default OnlyDesc;
