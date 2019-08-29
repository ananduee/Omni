import React, { Component } from "react";
import { observer } from "mobx-react";
import styled from "styled-components";
import ContentEditable from "react-contenteditable";

const ItemBullet = styled.div`
  width: 18px;
  height: 18px;
  display: inline-block;
  float: left;
  position: relative;
  right: 0.2em;
  bottom: 3px;
  z-index: 6;
  cursor: pointer;
  margin-top: 2px;
  color: rgb(75, 81, 85);
  :hover {
    border-radius: 50%;
    background: rgb(183, 188, 191) none repeat scroll 0% 0%;
  }
`;

const ChildrensBox = styled.div`
  margin-left: 0.33rem;
  padding-left: 1rem;
  margin-top: 0.25rem;
  border-left: 1px solid rgb(236, 238, 240);
`;

const taskEditBoxStyle = {
  display: "inline-block",
  width: "90%",
  minHeight: "1rem"
};

@observer
class SingleItemView extends Component {
  constructor(props) {
    super(props);
    this.itemEditBlock = React.createRef();
    this.handleInputChange = e => {
      this.props.itemNode.setTitle(e.target.value);
    };
    this.handleKeyDown = e => {
      // Add handler for arrow up and arrow down key.
      switch (e.key) {
        case "Enter":
          e.preventDefault();
          this.props.itemNode.addNextSibling();
          return null;
        case "Tab":
          e.preventDefault();
          this.props.itemNode.moveToRight();
        case "Backspace":
          if (this.props.itemNode.title === "<br>" || this.props.itemNode.title.length === 0) {
            e.preventDefault();
            this.props.itemNode.deleteNode();
          }
          return null;
        case "X":
          e.preventDefault();
          this.props.itemNode.toggleStrikeOut();
          return null;
        case "ArrowUp":
          e.preventDefault();
          this.props.itemNode.focusPreviousNode();
          return null;
        case "ArrowDown":
          e.preventDefault();
          return this.props.itemNode.focusNextNode();
        default:
          return null;
      }
    };
  }

  ensureComponentFoucs = () => {
    if (this.props.itemNode && this.props.itemNode.focused) {
      this.itemEditBlock.current.focus();
      this.props.itemNode.removeFocusFromNode();
    }
  };

  componentDidMount() {
    this.ensureComponentFoucs();
  }

  componentDidUpdate() {
    this.ensureComponentFoucs();
  }

  render() {
    // render block read focused property only to re-render in case of focus change.
    if (this.props.itemNode) {
      return (
        <React.Fragment>
          <div data-focused={this.props.itemNode.focused} className="worklog-item">
            <div>
              <ItemBullet>
                <svg viewBox="0 0 18 18" fill="currentColor">
                  <circle cx="9" cy="9" r="3.5"></circle>
                </svg>
              </ItemBullet>
              <ContentEditable
                id={"id_" + this.props.itemNode.id}
                innerRef={this.itemEditBlock}
                html={this.props.itemNode.title}
                disabled={false}
                onChange={this.handleInputChange}
                onKeyDown={this.handleKeyDown}
                style={taskEditBoxStyle}
                className="itemEditBox"
              />
            </div>
            <ChildrensBox>
              {this.props.itemNode.childrenRoot ? (
                <SingleItemView itemNode={this.props.itemNode.childrenRoot} />
              ) : null}
            </ChildrensBox>
          </div>
          {this.props.itemNode.next ? (
            <SingleItemView itemNode={this.props.itemNode.next} />
          ) : null}
        </React.Fragment>
      );
    } else {
      return null;
    }
  }
}

@observer
class View extends Component {
  render() {
    return (
      <div>
        <h4>This is your worklog :)</h4>
        <SingleItemView itemNode={this.props.store.root.childrenRoot} />
      </div>
    );
  }
}

export default View;
