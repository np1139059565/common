window.majax=(function(){
	try{
		const hr=new XMLHttpRequest()
		function f_query(params){
			try{
				params=Object.assign({
					url:null,
					type:"GET",
					success:(r)=>{console.info("success",r)},
					error:(r,code,o)=>{console.error("error",r,code,o)}
				},params)
				hr.open(params.type.toUpperCase(),params.url,true)
				hr.send()
				hr.onreadystatechange=()=>{
					try{
						if(hr.readyState==4){
							switch(hr.status){
								case 200:
									params.success(hr.responseText)
									break;
								default:
									params.error(hr.responseText,hr.status,hr)
									break;
							}
						}else{
							console.info("query...",hr.readyState,hr.responseText.length)
						}
					}catch(e){
						console.error(e.stack,e)
						params.error(null,-1,null)
					}
				}
			}catch(e){
				console.error(e.stack,e)
			}
		}
		return {
			f_query:f_query
		}
	}catch(e){
		console.error(e.stack,e)
		return {}
	}
})()
