//like handler
document.querySelector('.parent')
    .addEventListener('click',(dets)=>{
        if(dets.target.classList.contains('posting')){
            const post=dets.target.parentNode.parentNode;
            const heartWithBorder=post.querySelector('.heart');
            if(heartWithBorder.classList.contains('ri-heart-3-line')){
                heartWithBorder.classList.remove('ri-heart-3-line')
                heartWithBorder.classList.add('ri-heart-3-fill')
                heartWithBorder.classList.add('text-red-500')
            }else{
                heartWithBorder.classList.remove('ri-heart-3-fill')
                heartWithBorder.classList.remove('text-red-500')
                heartWithBorder.classList.add('ri-heart-3-line')
            }            
            fetch(`/like/${dets.target.dataset.postid}`)
                .then(raw=>raw.json())
                .then(response=>{
                    console.log(response.like.length);
                    post.querySelector('.likeval').textContent=response.like.length+' likes'
                })
        }
    })

//comment toggle div
document.querySelector('.parent').addEventListener('click',(docs)=>{
    if (docs.target.classList.contains('ri-chat-3-line')){
        const commentDiv = docs.target.parentNode.parentNode.nextElementSibling.nextElementSibling.nextElementSibling;
        if (commentDiv.classList.contains('hidden')) {
            commentDiv.classList.remove('hidden')
        } else {
            commentDiv.classList.add('hidden')
        }
    }
})

document.querySelector('.parent').addEventListener('click',(dd)=>{
    if (dd.target.classList.contains('comment-submit')){
        const buttonDiv=dd.target;
        const inputDiv = buttonDiv.previousElementSibling.children[0];
        console.log('bbbbbbbb',buttonDiv, inputDiv)
        // inputDiv.addEventListener('change', (docs) => {
            console.log('33333333333')
            // buttonDiv.addEventListener('click', (btn => {
                console.log('ahihihihihih',inputDiv.dataset)
                fetch(`/comment/${inputDiv.dataset.postid}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ data: inputDiv.value.trim() })
                })
                    .then(raw => raw.json())
                    .then(response => {
                        inputDiv.value = "";
                        buttonDiv.parentNode.previousElementSibling.textContent = response.comments.length + 'comments'
                    }).catch(err => console.log('xxxxxxxxxxxxxxxxxxx', err))
            // }))
        // })
    }
})