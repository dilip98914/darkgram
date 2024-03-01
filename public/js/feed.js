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
document.querySelector('#chatbox').addEventListener('click', (docs)=>{
    console.log('aaaaaaaaaaa',docs)
    const commentDiv=document.querySelector('#comment-div')
    if(commentDiv.classList.contains('hidden')){
        commentDiv.classList.remove('hidden')
    }else{
        commentDiv.classList.add('hidden')
    }
})
