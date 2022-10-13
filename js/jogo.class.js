
class Jogo
{
   tamanho_horizontal = 0 
   tamanho_vertical = 0
   quantidade_palavras = 0;
   dificuldade = 'medio' // facil, medio ou dificil

   mouse_pressionado = false // usado para controlar se o usuário está arrastando o mouse pressionado

   matriz_letras = [] // Variável usada para controlar se duas palavras coincidiram uma letra na mesma casa... caso sim, ela precisa ser igual

   celula_inicial_selecao_temporaria = null //Marcação temporária da seleção atual

   palavras_jogo = [] //Lista de palavras da partida
   finalizou_buscar_palavras = false // Aguardar a resposta da API que gera as palavras

   posicao_palavras = [] // Guarda casa de inicio e fim da palavra

   debug = false 

   grid = null

   // Inicia informando as dimensões do grid do jogo
   constructor (tamanho_horizontal, tamanho_vertical, quantidade_palavras, dificuldade)
   {
      this.tamanho_horizontal = tamanho_horizontal
      this.tamanho_vertical = tamanho_vertical
      this.quantidade_palavras = quantidade_palavras
      this.dificuldade = dificuldade

      //preenche uma matriz com todas as posições possíveis, todas com null
      for( let linha = 1; linha <= this.tamanho_vertical; linha++ ) {
         let array_linha = []
         for ( let coluna = 1; coluna <= this.tamanho_horizontal; coluna ++ ) {
            array_linha[coluna] = null
         }
         this.matriz_letras[linha] = array_linha
      }
   }

   // cria o grid com as ferramentas de seleção
   montaGrid()
   {
      let grid = document.createElement('table')
      grid.id = 'grid_jogo'
      grid.classList = ['grid']

      for( let linha = 1; linha <= this.tamanho_vertical; linha++ ) {

         let tr = document.createElement('tr')
         tr.classList = ['linha']

         for ( let coluna = 1; coluna <= this.tamanho_horizontal; coluna ++ ) {

            let td = document.createElement('td')
            td.classList = ['celula']
            td.id = `${linha}x${coluna}`
            td.setAttribute('x', linha)
            td.setAttribute('y', coluna)
            td.align = 'center'

            let letra
            if (this.matriz_letras[linha][coluna] != null) { //Se a posição atual foi definida como posição de uma palavra, traz a letra correta
               letra = this.matriz_letras[linha][coluna]

               if (this.debug) { //traz as palavras selecionadas
                  td.classList.add('selecao_correta')
               }
            }
            else { // gera uma letra aleatoria
               let alfabeto = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
               let index = Math.floor(Math.random() * alfabeto.length ) 
               letra = alfabeto.charAt(index)
            }

            td.innerHTML = letra

            tr.appendChild(td)

         }

         grid.appendChild(tr)

      }

      this.grid = grid

      this.montaControladorSelecaoGrid()

   }

   //Printa o grid na div
   mostraGrid()
   {
      let div_jogo = document.getElementById('jogo')

      div_jogo.appendChild(this.grid)
   }

   //Monta os listeners e controladores das ações do grid
   montaControladorSelecaoGrid()
   {

      let jogo = this

      //Controla o inicio do clique de seleção
      this.grid.onmousedown = function (event) {
         
         let td = document.elementFromPoint(event.clientX, event.clientY)

         jogo.mouse_pressionado = true
         jogo.celula_inicial_selecao_temporaria = td

         Jogo.limparSelecaoTemporaria()

         if (jogo.debug) {
            console.log(`iniciou click no td ${td.id}`)
         }
         
      }

      //Controla o momento que solta o clique
      this.grid.onmouseup = function (event) {

         let td = document.elementFromPoint(event.clientX, event.clientY)

         jogo.mouse_pressionado = false

         let resultado_verificacao = jogo.verificarTentativa(jogo.celula_inicial_selecao_temporaria, td)

         if (resultado_verificacao) {
            jogo.validarAcerto(jogo.celula_inicial_selecao_temporaria, td, resultado_verificacao)
         }

         Jogo.limparSelecaoTemporaria()

         if (jogo.debug) {
            console.log(`terminou click no td ${td.id}`)
         }
         
      }

      //controla as casas que o mouse passa por cima enquanto está pressionado, destacando se a seleção atual é valida ou não
      this.grid.onmouseover = function (event) {

         let celula_atual = document.elementFromPoint(event.clientX, event.clientY)

         if (jogo.mouse_pressionado) {

            if (jogo.debug) {
               console.log(`iniciou em ${jogo.celula_inicial_selecao_temporaria.id} e agora está em ${celula_atual.id}`)
            }
            
            if ( Jogo.validaLinha(jogo.celula_inicial_selecao_temporaria, celula_atual) ) {
               Jogo.destacaSelecaoTemporaria(jogo.celula_inicial_selecao_temporaria, celula_atual)
            }

            else {
               Jogo.limparSelecaoTemporaria()
            }
         }
      }
   }

   //Função chamada quando a tentativa é um acerto. Aqui vai marcar a palavra como encontrada e destacar ela no grid
   validarAcerto(celula_inicial, celula_final, palavra)
   {

      let jogo = this

      Jogo.getCelulasEntre(celula_inicial, celula_final).forEach((celula) => {
         celula.classList.add('selecao_correta')
      })

      jogo.posicao_palavras[palavra].push('encontrado')

      jogo.mostrarListaPalavrasDiv()

   }

   //verifica se a linha selecionada é valida
   static validaLinha(celula_inicial, celula_final)
   {
      return Jogo.getTipoLinha(celula_inicial, celula_final) != false
   }

   //Verifica se a linha é horizontal, vertical ou diagonal
   static getTipoLinha(celula_inicial, celula_final)
   {

      let x_ini = celula_inicial.getAttribute('x')
      let x_fin = celula_final.getAttribute('x')
      let y_ini = celula_inicial.getAttribute('y')
      let y_fin = celula_final.getAttribute('y')

      //Linha horizontal
      if (x_ini == x_fin) {
         return 'horizontal'
      }
      //Linha vertical
      else if (y_ini == y_fin) {
         return 'vertical'
      }
      //Linha diagonal
      else if ( Math.abs(x_ini - x_fin) == Math.abs(y_ini - y_fin) ) {
         return 'diagonal'
      }
      else {
         return false
      }

   }

   //cria um destaque temporário na linha no momento da seleção
   static destacaSelecaoTemporaria(celula_inicial, celula_final)
   {
      let tipo_linha = Jogo.getTipoLinha(celula_inicial, celula_final)

      let celulas = Jogo.getCelulasEntre(celula_inicial, celula_final, tipo_linha)

      Jogo.limparSelecaoTemporaria()

      celulas.forEach((celula) => {
         celula.classList.add('selecao_temporaria')
      })

   }

   //Limpa a seleção temporária ao terminar o clique
   static limparSelecaoTemporaria()
   {
      Array.from(document.getElementsByClassName('selecao_temporaria')).forEach((element) => {
         element.classList.remove('selecao_temporaria')
      })
   }

   //retorna um array de celulas que estão entre um ponto inicial e um ponto final
   static getCelulasEntre(celula_inicial, celula_final, tipo_linha = null)
   {

      let x1 = parseInt(celula_inicial.getAttribute('x'))
      let x2 = parseInt(celula_final.getAttribute('x'))
      let y1 = parseInt(celula_inicial.getAttribute('y'))
      let y2 = parseInt(celula_final.getAttribute('y'))

      if (tipo_linha == null) {
         if ( x1 == x2) {
            tipo_linha = 'horizontal'
         }
         else if (y1 == y2) {
            tipo_linha = 'vertical'
         }
         else {
            tipo_linha = 'diagonal'
         }
      }

      let celulas = []

      if (tipo_linha == 'horizontal') {

         let y_ini =  y1 > y2 ? y2 : y1
         let y_fin =  y1 > y2 ? y1 : y2

         for ( let contador = y_ini; contador <= y_fin; contador++ ) {
            celulas.push(document.getElementById(`${x1}x${contador}`))
         }

      }
      else if (tipo_linha == 'vertical') {

         let x_ini =  x1 > x2 ? x2 : x1
         let x_fin =  x1 > x2 ? x1 : x2

         for ( let contador = x_ini; contador <= x_fin; contador++ ) {
            celulas.push(document.getElementById(`${contador}x${y1}`))
         }

      }
      else if (tipo_linha == 'diagonal') {

         let distancia = Math.abs(x1 - x2) + 1
         let aux_x = x1
         let aux_y = y1
         
         for ( let contador = 0; contador < distancia; contador++) {

            if (contador > 0) {
               aux_x = x1 > x2 ? --aux_x : ++aux_x
               aux_y = y1 > y2 ? --aux_y : ++aux_y
            }

            celulas.push(document.getElementById(`${aux_x}x${aux_y}`))

         }

      }

      return celulas
   }

   //retorna um array de posicoes(ids) que estão entre um ponto inicial e um ponto final
   static getPosicoesEntre(posicao_inicial, posicao_final, tipo_linha)
   {

      let [x1, y1] = posicao_inicial.split('x')
      let [x2, y2] = posicao_final.split('x')
      x1 = parseInt(x1)
      x2 = parseInt(x2)
      y1 = parseInt(y1)
      y2 = parseInt(y2)

      if (this.debug) {
         console.log(x1, x2, y1, y2, posicao_inicial.split('x'), posicao_final)
      }

      let celulas = []

      if (tipo_linha == 'horizontal') {

         let y_ini =  y1 > y2 ? y2 : y1
         let y_fin =  y1 > y2 ? y1 : y2

         for ( let contador = y_ini; contador <= y_fin; contador++ ) {
            celulas.push(`${x1}x${contador}`)
         }

      }
      else if (tipo_linha == 'vertical') {

         let x_ini =  x1 > x2 ? x2 : x1
         let x_fin =  x1 > x2 ? x1 : x2

         for ( let contador = x_ini; contador <= x_fin; contador++ ) {
            celulas.push(`${contador}x${y1}`)
         }

      }
      else if (tipo_linha == 'diagonal') {

         let distancia = Math.abs(x1 - x2) + 1
         let aux_x = x1
         let aux_y = y1
         
         for ( let contador = 0; contador < distancia; contador++) {

            if (contador > 0) {
               aux_x = x1 > x2 ? --aux_x : ++aux_x
               aux_y = y1 > y2 ? --aux_y : ++aux_y
            }

            celulas.push(`${aux_x}x${aux_y}`)

         }

      }

      return celulas
   }
   
   //Função que faz os preparativos para iniciar a partida, sorteando as palavras, posicionando e montando o grid
   iniciarJogo()
   {
      this.buscarPalavras()

      let jogo = this

      //Manda buscar as palavras e vai atualizando até finalizar a busca
      var interval_uid = setInterval(() => {
         if (jogo.finalizou_buscar_palavras) {

            Swal.close()
            
            clearInterval(interval_uid)

            jogo.mostrarListaPalavrasDiv()
            
            jogo.definirPosicaoPalavrasGrid()
            jogo.montaGrid()
            jogo.mostraGrid()

            if (jogo.debug) {
               console.log(jogo.palavras_jogo)
            }

         }
      }, 100)
   }

   //Verifica se a tentativa que o jogador fez coincide com a posição de alguma das palavras
   verificarTentativa(posicao_inicial, posicao_final) {

      let acerto = false
      let palavra_acerto = null

      let jogo = this

      if (posicao_inicial.id != posicao_final.id) {
         this.palavras_jogo.forEach((palavra) => {
            if ( jogo.posicao_palavras[palavra].includes(posicao_inicial.id) && jogo.posicao_palavras[palavra].includes(posicao_final.id)) {
               acerto = true
               palavra_acerto = palavra
            }
         })
      }

      return !acerto ? acerto : palavra_acerto

   }

   //Faz um foreach no numero de palavras que deve buscar, sorteando uma por uma
   buscarPalavras()
   {

      for (let contador = 0; contador < this.quantidade_palavras; contador++) {
         this.buscarPalavra()
      }
      
   }

   //Busca a palavra em uma API
   buscarPalavra()
   {

      let jogo = this

      fetch('https://api.dicionario-aberto.net/random').then((response) => response.json()).then((json) => {
            
         if (json.word.length <= jogo.tamanho_horizontal && json.word.length <= jogo.tamanho_vertical && json.word.length > 3 ) {
            jogo.palavras_jogo.push(json.word.toUpperCase())

            if (jogo.palavras_jogo.length == this.quantidade_palavras) {
               jogo.finalizou_buscar_palavras = true
            }
         }
         else {
            if (jogo.debug) {
               console.log(`Palavra ${json.word} muito grande`)
            }
            jogo.buscarPalavra()
         }

      })
   }

   //Faz um foreach nas palavras, definindo uma posição valida para cada uma delas
   definirPosicaoPalavrasGrid()
   {


      this.palavras_jogo.forEach((palavra) => {
         
         this.sortearPosicaoPalavraGrid(palavra)

      })
   }

   //Sorteia uma posição valida para a palavra atual
   sortearPosicaoPalavraGrid(palavra)
   {
      let direcao = this.sortearDirecao()

      let inicio_x = null
      let inicio_y = null

      let fim_x = null
      let fim_y = null

      let jogo = this

      if (direcao == 'horizontal') {
         inicio_x = Math.floor(Math.random() * ( jogo.tamanho_vertical ) ) + 1
         inicio_y = Math.floor(Math.random() * ( jogo.tamanho_horizontal - palavra.length ) + 1 ) + 1

         fim_x = inicio_x
         fim_y = inicio_y + ( palavra.length - 1 )
      }
      else if (direcao == 'vertical') {
         inicio_x = Math.floor(Math.random() * ( jogo.tamanho_vertical - palavra.length ) + 1 ) + 1
         inicio_y = Math.floor(Math.random() * ( jogo.tamanho_horizontal ) ) + 1

         fim_x = inicio_x + ( palavra.length - 1 )
         fim_y = inicio_y
      }
      else {
         let direcao_diagonal = Math.floor(Math.random() * 10 ) % 2 == 0 ? 'cima_baixo' : 'baixo_cima'

         inicio_y = Math.floor(Math.random() * ( jogo.tamanho_horizontal - palavra.length ) + 1 ) + 1
         fim_y = inicio_y + (palavra.length - 1)

         if (jogo.debug) {
            console.log('Direção diagonal: ' + direcao_diagonal)
         }
   
         if (direcao_diagonal == 'cima_baixo') {
            inicio_x = Math.floor(Math.random() * ( jogo.tamanho_vertical - palavra.length ) + 1 ) + 1
            fim_x = inicio_x + (palavra.length - 1)
            
         }
         else {
            inicio_x = Math.floor(Math.random() * ( jogo.tamanho_vertical - palavra.length ) + 1 ) + palavra.length
            fim_x = inicio_x - (palavra.length - 1)
         }
         
      }

      let posicao_inicial = `${inicio_x}x${inicio_y}`
      let posicao_final = `${fim_x}x${fim_y}`

      if (jogo.debug) {
         console.log(`buscando posicoes entre: ${posicao_inicial} e ${posicao_final}`)
         console.log(Jogo.getPosicoesEntre(posicao_inicial, posicao_final, direcao))
      }

      let posicoes = Jogo.getPosicoesEntre(posicao_inicial, posicao_final, direcao)
      
      //Se estiver no dificil a palavra pode vir invertida
      let palavra_final = palavra
      if (this.dificuldade == 'dificil') {
         palavra_final = Math.floor(Math.random() * 10 ) % 2 == 0 ? palavra.split('').reverse().join('') : palavra
      }

      let palavra_array = palavra_final.split('')

      if (jogo.debug) {
         console.log(palavra_array)
      }

      let passou = true
      posicoes.forEach((posicao) => {
         let [x, y] = posicao.split('x')
         if ( jogo.matriz_letras[x][y] != null && jogo.matriz_letras[x][y] != palavra_array[posicoes.indexOf(posicao)] ) {
            passou = false
            if (jogo.debug) {
               console.log('posicao atual invalida! realocando palavra')
            }
         }
      })

      if (passou) {
         posicoes.forEach((posicao) => {
            let [x, y] = posicao.split('x')
            jogo.matriz_letras[x][y] = palavra_array[posicoes.indexOf(posicao)]
         })

         this.posicao_palavras[palavra] = [posicao_inicial, posicao_final]

         if (this.debug) {
            console.log(`Palavra: ${palavra} - Direção: ${direcao} - inicia em ${inicio_x}x${inicio_y} e termina em ${fim_x}x${fim_y}`)
            console.log(this.matriz_letras)
            console.log(this.posicao_palavras)
         }
      }
      else {
         this.sortearPosicaoPalavraGrid(palavra)
      }
      
   }

   //Preenche a div de detalhes da partida
   mostrarListaPalavrasDiv()
   {
      let ul = document.createElement('ul')

      let palavras_restantes = this.quantidade_palavras

      for ( let index = 0; index < this.palavras_jogo.length; index++) {

         let palavra = this.palavras_jogo[index]

         let encontrado = false

         if (typeof this.posicao_palavras[palavra] != 'undefined') {
            if (this.posicao_palavras[palavra].includes('encontrado')) {
               palavras_restantes--
               encontrado = true
            }
         }

         let li = document.createElement('li')
         li.innerHTML = palavra
         if (encontrado) {
            li.style.textDecoration = 'line-through'
         }
         ul.appendChild(li)
      }

      let br = document.createElement('br')

      let div_palavras_restantes = document.createElement('div')
      div_palavras_restantes.classList.add('div_palavras_restantes')
      div_palavras_restantes.appendChild(document.createElement('br'))
      div_palavras_restantes.appendChild(document.createElement('br'))

      let span_palavras_restantes = document.createElement('span')
      span_palavras_restantes.innerHTML = `Palavras restantes: ${palavras_restantes}`

      if (palavras_restantes == 0) {
         span_palavras_restantes.appendChild(document.createElement('br'))

         let span_fim_jogo = document.createElement('span')
         span_fim_jogo.innerHTML = 'Fim de jogo! Parabéns!'
         span_palavras_restantes.appendChild(span_fim_jogo)

         let botao_reiniciar = document.createElement('button')
         botao_reiniciar.innerHTML = 'Jogar novamente!'
         botao_reiniciar.onclick = () => {
            let div_configs = document.getElementById('configs')
            let div_base_jogo = document.getElementById('base_jogo')

            div_configs.style.display = 'inline'
            div_base_jogo.style.display = 'none'

            document.getElementById('jogo').innerHTML = ''
            document.getElementById('lista_palavras').innerHTML = ''
            delete this
         }

         span_palavras_restantes.appendChild(document.createElement('br'))
         span_palavras_restantes.appendChild(botao_reiniciar)

         
      }

      div_palavras_restantes.appendChild(span_palavras_restantes)

      let botao_imprimir = document.createElement('button')
      botao_imprimir.classList.add('imprimir')
      botao_imprimir.innerHTML = 'Imprimir'
      botao_imprimir.onclick = () => {
         window.print()
      }

      let div_lista = document.getElementById('lista_palavras')

      div_lista.innerHTML = ul.innerHTML
      div_lista.appendChild(div_palavras_restantes)
      div_lista.appendChild(br)
      div_lista.appendChild(botao_imprimir)

   }

   //Sorteia a direção da palavra antes de posicioná-la... horizontal vertical ou diagonal
   sortearDirecao()
   {
      let direcao

      if (this.dificuldade == 'facil') {
         direcao = Math.floor(Math.random() * 10 ) % 2 == 0 ? 'horizontal' : 'vertical'
      }
      else {
         let random = Math.floor(Math.random() * 12 ) % 3
         direcao = random == 0 ? 'horizontal' : ( random == 1 ? 'vertical' : 'diagonal')
      }

      return direcao
   }

   toString()
   {
      console.log(`Tamanho Horizontal: ${this.tamanho_horizontal}`)
      console.log(`Tamanho Vertical: ${this.tamanho_vertical}`)
      console.log(`Dificuldade: ${this.dificuldade}`)
      console.log(`Quantidade de palavras: ${this.quantidade_palavras}`)
   }
}