class ProjectorDesc extends HTMLElement {
    constructor() {
        super();

        this.attachShadow({ mode: 'open' });

        const template = document.createElement('template');
        template.innerHTML = `
            <style>
                li {
                    width: 100%;
                    padding: 1vh 2vw;
                    margin: 1vh 0vw;
                    
                    border-color: dimgrey;
                    background-color:whitesmoke;
                    border-style: solid;

                    
                    display:flex;
                    flex-direction: column;
                    align-items: start;
                }
            p {
                margin: 0 0 10px;
            }
            </style>
            <li id="tv-channel">
                <p class="projector-name">Name: <span id="name"></span></p>
                <p class="projector-status">State: <span id="state"></span></p>
            </li>
        `;

        this.shadowRoot.appendChild(template.content.cloneNode(true));

        this.nameElement = this.shadowRoot.getElementById('name');
        this.stateElement = this.shadowRoot.getElementById('state');
    }

    // Define properties for the custom element
    static get observedAttributes() {
        return ['name', 'state'];
    }

    // Handle attribute changes
    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'name') {
            this.nameElement.textContent = newValue;
        } else if (name === 'state') {
            this.stateElement.textContent = newValue;
        }
    }
}

customElements.define('projector-desc', ProjectorDesc);
