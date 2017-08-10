import React, {Component} from "react";
import {translate} from "react-i18next";

// Glossary Page
//  - make sure all examples use HTML entities to escape reserve characters
//  - like '<' or '>'
//  - use this site for help: https://mothereff.in/html-entities

class Glossary extends Component {

  render() {

    const {t} = this.props;

    return (
      <div id="about-container">
        <h1>{ t("glossary.title") }</h1>

        <h2 name="html">HTML</h2>
        <p>{ t("glossary.html.def") }</p>
        <p><strong>{ t("glossary.example") }</strong></p>
        <pre>
        &lt;html&gt;
          { t("glossary.html.exampleTxt1") }
        &lt;/html&gt;
        </pre>
        
        <h2 name="css">CSS</h2>
        <p>{ t("glossary.CSS.def") }</p>
        
        <h2 name="selector">selector</h2>
        <p>{ t("glossary.selector.def") }</p>
        
        <h2 name="property">property</h2>
        <p>{ t("glossary.property.def") }</p>
        
        <h2 name="value">Value</h2>
        <p>{ t("glossary.value.def") }</p>
        
        <h2 name="style">&lt;style&gt;</h2>
        <p>{ t("glossary.style.def") }</p>
        
        <h2 name="letterSpacing">letter-spacing</h2>
        <p>{ t("glossary.letterSpacing.def") }</p>
        
        <h2 name="color">color</h2>
        <p>{ t("glossary.color.def") }</p>
        
        <h2 name="backgroundColor">background-color</h2>
        <p>{ t("glossary.backgroundColor.def") }</p>
        
        <h2 name="string">String</h2>
        <p>{ t("glossary.string.def") }</p>
        
        <h2 name="textAlign">text-align</h2>
        <p>{ t("glossary.textAlign.def") }</p>
            
        <h2 name="alert">alert()</h2>
        <p>{ t("glossary.alert.def") }</p>
        
        <h2 name="backgroundImage">background-image</h2>
        <p>{ t("glossary.backgroundImage.def") }</p>
        
        <h2 name="method">Method</h2>
        <p>{ t("glossary.method.def") }</p>
        
        <h2 name="script">&lt;script&gt;</h2>
        <p>{ t("glossary.script.def") }</p>

        <h2 name="css">CSS</h2>
        <p>{ t("glossary.css.def") }</p>

        <h2 name="javascript">JavaScript</h2>
        <p>{ t("glossary.javascript.def") }</p>

        <h2 name="code">code</h2>
        <p>{ t("glossary.code.def") }</p>

        <h2 name="codeeditor">code editor</h2>
        <p>{ t("glossary.codeeditor.def") }</p>

        <h2 name="tags">tags</h2>
        <p>{ t("glossary.tags.def") }</p>

        <h2 name="openingtag">opening tag</h2>
        <p>{ t("glossary.openingtag.def") }</p>
        <p><strong>{ t("glossary.example") }</strong></p>
        <pre>
        &lt;html&gt;
          { t("glossary.openingtag.exampleTxt1") }
        &lt;/html&gt;
        </pre>

        <h2 name="closingtag">closing tag</h2>
        <p>{ t("glossary.closingtag.def") }</p>
        <p><strong>{ t("glossary.example") }</strong></p>
        <pre>
        &lt;html&gt;
          { t("glossary.closingtag.exampleTxt1") }
        &lt;/html&gt;
        </pre>

        <h2 name="metadata">metadata</h2>
        <p>{ t("glossary.metadata.def") }</p>

        <h2 name="sourcecode">source code</h2>
        <p>{ t("glossary.sourcecode.def") }</p>

        <h2 name="htmltag">html tag</h2>
        <p>{ t("glossary.htmltag.def") }</p>

        <h2 name="titletag">title tag</h2>
        <p>{ t("glossary.titletag.def") }</p>

        <h2 name="body">body tag</h2>
        <p>{ t("glossary.body.def") }</p>

        <h2 name="h1">h1 tag</h2>
        <p>{ t("glossary.h1.def") }</p>

        <h2 name="p">p tag</h2>
        <p>{ t("glossary.p.def") }</p>
      </div>
    );
  }
}

export default translate()(Glossary);
