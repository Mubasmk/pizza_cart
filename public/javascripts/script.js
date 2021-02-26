//product adding to cart function
function addToCart(proId) {
    $.ajax({
        url: '/addCart/' + proId,
        method: 'get',
        success: (response) => {
            if (response.status) {
                let count = $('#cart-count').html()
                count = parseInt(count) + 1;
                $('#cart-count').html(count);
                $(".notify").toggleClass("active");
                $("#notifyType").toggleClass("success");

                setTimeout(function () {
                    $(".notify").removeClass("active");
                    $("#notifyType").removeClass("success");
                }, 2000);
            }
        }
    }
    );
};
//product adding to cart function

//cart items quantity increment or decrement 
function changeQuantity(cartId, proId, userId, count) {
    let quantity = parseInt(document.getElementById(proId).innerHTML);
    count = parseInt(count);
    $.ajax({
        url: '/change-product-quantity',
        data: {
            user: userId,
            cart: cartId,
            product: proId,
            count: count,
            quantity: quantity
        },
        method: 'post',
        
        success: (response) => {
            if (response.removeProduct) {
                $(".remove").toggleClass("removeActive");
                $("#removeType").toggleClass("removeSuccess");

                setTimeout(function () {
                    $(".remove").removeClass("removeActive");
                    $("#removeType").removeClass("removeSuccess");
                }, 500);
                setTimeout(() => {
                    
                    location.reload()
                }, 600);
            } else {
                document.getElementById(proId).innerHTML = quantity + count;
                document.getElementById('total').innerHTML = response.total;
            }
        }
    });
};
//cart items quantity increment or decrement 

//cart items remove from cart
function removeCartItem(cartId, proId, userId) {
    $.ajax({
        url: '/remove-cart-item',
        data: {
            user: userId,
            cart: cartId,
            product: proId
        },
        method: 'post',
        success: (response) => {
            if (response.removeCartItem) {
                
                $(".remove").toggleClass("removeActive");
                $("#removeType").toggleClass("removeSuccess");

                setTimeout(function () {
                    $(".remove").removeClass("removeActive");
                    $("#removeType").removeClass("removeSuccess");
                }, 500);
                setTimeout(() => {
                    
                    location.reload()
                }, 600);
            }
        }
    });
};
//cart items remove from cart