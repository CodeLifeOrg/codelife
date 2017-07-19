import React, {Component} from "react";
import {Button, Dialog, Intent, Popover, PopoverInteractionKind,
          Position} from "@blueprintjs/core";

// Ui orphan page, made solely for the purpose of showing examples of various
// UI elements from blueprintjs that we will be using throughout the site.

class Ui extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isOpen: false
    };
  }

  toggleDialog() {
    const toggledIsOpen = this.state.isOpen ? false : true;

    this.setState({
      isOpen: toggledIsOpen
    });
  }

  render() {
    const toggleDialog = this.toggleDialog.bind(this);

    return (
      <div>
        <h1>CodeLife UI Examples Page</h1>

        {/* Example of Tooltip shown on click */}
        <Popover
          interactionKind={PopoverInteractionKind.CLICK}
          popoverClassName="pt-popover-content-sizing"
          position={Position.RIGHT}
        >
          <Button intent={Intent.PRIMARY}>Click for tooltip</Button>
          <div>
            <h5>Tooltip Title</h5>
            <p>...</p>
            <Button className="pt-popover-dismiss">Dismiss</Button>
          </div>
        </Popover>

        <br />

        {/* Example of Tooltip shown on hover */}
        <Popover
          interactionKind={PopoverInteractionKind.HOVER}
          popoverClassName="pt-popover-content-sizing"
          position={Position.RIGHT}
        >
          <Button intent={Intent.PRIMARY}>Hover for tooltip</Button>
          <div>
            <h5>Tooltip Title</h5>
            <p>...</p>
            <Button className="pt-popover-dismiss">Dismiss</Button>
          </div>
        </Popover>

        {/* Example Modal triggered to be shown on click */}
        <div>
            <Button onClick={toggleDialog} text="Click for modal" />
            <Dialog
              iconName="inbox"
              isOpen={this.state.isOpen}
              onClose={toggleDialog}
              title="Modal header content"
            >
              <div className="pt-dialog-body">Blah, blah, blah... some content</div>
              <div className="pt-dialog-footer">
                <div className="pt-dialog-footer-actions">
                  <Button text="Secondary" />
                  <Button
                    intent={Intent.PRIMARY}
                    onClick={toggleDialog}
                    text="Close"
                  />
                </div>
              </div>
            </Dialog>
        </div>
      </div>
    );
  }
}

export default Ui;
