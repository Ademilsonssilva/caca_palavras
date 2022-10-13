let button = document.getElementById('iniciar')

button.onclick = function () {

   Swal.fire({
      text: 'Carregando...',
      didOpen: () => {
         Swal.showLoading()
      }
   })

   let quantidade_horizontal = 18
   let quantidade_vertical = 23
   let quantidade_palavras = parseInt(document.getElementById('select_quantidade').value)
   let dificuldade = document.getElementById('select_dificuldade').value

   let jogo = new Jogo(quantidade_horizontal, quantidade_vertical, quantidade_palavras, dificuldade)

   jogo.debug = false

   jogo.iniciarJogo()

   let div_configs = document.getElementById('configs')
   let div_base_jogo = document.getElementById('base_jogo')

   div_configs.style.display = 'none'
   div_base_jogo.style.display = 'flex'

}

