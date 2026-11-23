/* Font binaries are local-only; do not redistribute personal-use font files. */
window.tenzerLocalFontsReady=Promise.resolve();
if(['localhost','127.0.0.1'].includes(location.hostname)&&window.FontFace){
  const face=new FontFace('UD Digi Kyokasho NK-B','url(assets/fonts/UDDigiKyokashoNK-B.ttf)',{weight:'700'});
  window.tenzerLocalFontsReady=face.load().then(font=>document.fonts.add(font)).catch(()=>{});
}
