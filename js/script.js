
//? This code is for animating details
//? of summary component and slightly modified 
//? https://css-tricks.com/how-to-animate-the-
//? details-element-using-waapi/




class Accordion {
    constructor(el) {
      this.el = el;
      this.summary = el.querySelector('summary');
      this.content = el.querySelector('.faq-content');
      this.expandIcon = this.summary.querySelector('.expand-icon')
      this.animation = null;
      this.isClosing = false;
      this.isExpanding = false;
      this.summary.addEventListener('click', (e) => this.onClick(e));
    }
  
    async onClick(e) {
      
      //MANDAR SEÑAL A ARDUINO DE LED QUE DEBE PRENDERSE
      console.log(`ID of element clicked: ${this.el.id}`);
      if (!port) {
        await connectToArduino();
      }
      await sendCommand((1+Number(this.el.id)));

      e.preventDefault();
      this.el.style.overflow = 'hidden';

      if (this.isClosing || !this.el.open) {
        this.open();
      } else if (this.isExpanding || this.el.open) {
        this.shrink();
      }
    }
  
    shrink() {
      this.isClosing = true;

      const startHeight = `${this.el.offsetHeight}px`;
      const endHeight = `${this.summary.offsetHeight}px`;

      if (this.animation) {
        this.animation.cancel();
      }
      
      this.animation = this.el.animate({
        height: [startHeight, endHeight]
      }, {
        duration: 400,
        easing: 'ease-out'
      });

      this.animation.onfinish = () => {
        this.expandIcon.setAttribute('src', 'assets/plus.svg');
        return this.onAnimationFinish(false);
      }
      this.animation.oncancel = () => {
        this.expandIcon.setAttribute('src', 'assets/plus.svg');
        return this.isClosing = false;
      }
    }
  
    open() {

      this.el.style.height = `${this.el.offsetHeight}px`;
      this.el.open = true;
      window.requestAnimationFrame(() => this.expand());

      
    }
  
    expand() {
      this.isExpanding = true;

      const startHeight = `${this.el.offsetHeight}px`;
      const endHeight = `${this.summary.offsetHeight + 
                           this.content.offsetHeight}px`;

      if (this.animation) {
        this.animation.cancel();
      }
      
      this.animation = this.el.animate({
        height: [startHeight, endHeight]
      }, {
        duration: 350,
        easing: 'ease-out'
      });

      this.animation.onfinish = () => {
        this.expandIcon.setAttribute(
            'src',
            'assets/minus.svg'
        );
        return this.onAnimationFinish(true);
      }
      this.animation.oncancel = () => {
        this.expandIcon.setAttribute(
            'src',
            'assets/minus.svg'
        );
        return this.isExpanding = false;
      }
    }
  
    onAnimationFinish(open) {
      this.el.open = open;
      this.animation = null;
      this.isClosing = false;
      this.isExpanding = false;
      this.el.style.height = this.el.style.overflow = '';
    }
  }
  
  let accordionNum = 0;
  document.querySelectorAll('details').forEach((el) => {
    el.id = `${++accordionNum}`;
    el.addEventListener('click', ()=>{
      dynamic_image = document.getElementById('dynamic_image');
      dynamic_image.src = `../images/${el.id}.JPG`;
    });
    new Accordion(el);
  });


  
// Código para la conexión con Arduino

let port;
let writer;
let reader;

// document.getElementById('ledOnButton').addEventListener('click', async () => {
//     if (!port) {
//         await connectToArduino();
//     }
//     await sendCommand('1');
// });

// document.getElementById('ledOffButton').addEventListener('click', async () => {
//     if (!port) {
//         await connectToArduino();
//     }
//     await sendCommand('0');
// });

async function connectToArduino() {
    try {
        port = await navigator.serial.requestPort();
        await port.open({ baudRate: 9600 });

        const encoder = new TextEncoderStream();
        writer = encoder.writable.getWriter();
        const outputDone = encoder.readable.pipeTo(port.writable);

        const decoder = new TextDecoderStream();
        reader = decoder.readable.getReader();
        const inputDone = port.readable.pipeTo(decoder.writable);

        readLoop();

        console.log('Conectado al Arduino');
    } catch (error) {
        console.error('Error al conectar con Arduino:', error);
    }
}

async function sendCommand(command) {
    if (writer) {
        await writer.write(command); // Enviar comando para encender o apagar el LED
        console.log(`Señal enviada: ${command}`);
    }
}

async function readLoop() {
    while (true) {
        const { value, done } = await reader.read();
        if (done) {
            console.log('Stream cerrado');
            reader.releaseLock();
            break;
        }
        console.log('Respuesta del Arduino:', value);
    }
}

