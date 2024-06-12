const Util = {
    numberWithCommas: function(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
    removeNonNumber: function(x){
        return x.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    },
    getCsrfToken: function(){
        const tokenMeta = document.querySelector('meta[name="csrf-token"]');
        if(!tokenMeta) return null;
        const tokenMetaValue = tokenMeta.getAttribute('content');
        return tokenMetaValue;
    },
    updateQueryStringParameter:function(uri, key, value) {
        var re        = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
        var separator = uri.indexOf('?') !== -1 ? "&" : "?";
        if (uri.match(re)) {
            return uri.replace(re, '$1' + key + "=" + value + '$2');
        }
        else {
            return uri + separator + key + "=" + value;
        }
    },
    englishDigitsInput: function(input){
        $(input).on('input', function (e) {
            return this.value = Util.toEnglishDigits(this.value.replace(/[^\d\u06F0-\u06F90-9]+$/, ''));
        });
    },
    toEnglishDigits: function(str){
        // convert persian digits [۰۱۲۳۴۵۶۷۸۹]
        var e = '۰'.charCodeAt(0);
        str = str.replace(/[۰-۹]/g, function (t) {
            return t.charCodeAt(0) - e;
        });

        // convert arabic indic digits [٠١٢٣٤٥٦٧٨٩]
        e = '٠'.charCodeAt(0);
        str = str.replace(/[٠-٩]/g, function (t) {
            return t.charCodeAt(0) - e;
        });
        return str;
    },
    numberInput: function(input){
        $(input).on('keydown', function (evt) {
            var theEvent = evt || window.event;

            if (theEvent.type === 'paste') {
                key = event.clipboardData.getData('text/plain');
            } else {
                var key = theEvent.keyCode || theEvent.which;
                key = String.fromCharCode(key);
            }
            var regex = /[0-9]|\./;
            if (!regex.test(key) && (theEvent.keyCode !== 8 || theEvent.which !== 8)) {
                theEvent.returnValue = false;
                if (theEvent.preventDefault) theEvent.preventDefault();
            }
        });
    },
    priceInput: function(input){
        $(input).on('keyup',function(evt){
            // $(this).val(numberWithCommas(evt.target.value.replace(',','')));
        });
        $(input).on('input',function(){
            $(this).val(numberWithCommas($(this).val().replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')));
        });
    },
    getParameterByName(name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    },
    getParameterByNameWithArraySupport(key,target){
        var values = [];
        if (!target) target = location.href;

        key = key.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");

        var pattern = key + '=([^&#]+)';
        var o_reg = new RegExp(pattern,'ig');
        while (true){
            var matches = o_reg.exec(target);
            if (matches && matches[1]){
                values.push(matches[1]);
            } else {
                break;
            }
        }

        if (!values.length){
            return null;
        } else {
            return values.length == 1 ? values[0] : values;
        }
    }
};

const URLS = {
    submitComment: $('[data-name="send-comment-url"]')?.val() || null,
    provinceCities: $('[data-name="province-url"]')?.val() || null,
    checkReservedUrl: $('meta[name="check-reserved-url"]')?.attr('content') || null,
    applyDiscount: $('meta[name="apply-discount-url"]')?.attr('content') || null,
    removeProductFromOrder: $('meta[name="remove-product-from-order-url"]')?.attr('content') || null,
    applyCouponOrder: $('meta[name="apply-coupon-order-url"]')?.attr('content') || null,
    cancelOrder: $('meta[name="cancel-order-url"]')?.attr('content') || null,
    transportMethodUrl: $('meta[name=transport-method-url]')?.attr('content') || null,
    syncBasketUrl: $('meta[name=sync-basket-url]')?.attr('content') || null,
    searchProducts: $('meta[name="search-products-url"]')?.attr('content') || null
};

class SingleProductPage{
    constructor(){
        this.mainGallerySwiper = null;
        this.thumbnailGallerySwiper = null;
        this.modalPreviewSwiper = null;
        this.initGallery();
        this.initGalleryThumbnails();
        this.initModalPreview();
        this.initVariants();
    }
    initGallery(){
        const self = this;
        this.mainGallerySwiper = new Swiper('.single-product-header-gallery', {
            direction: window.innerWidth < 1024 ? 'horizontal' : 'vertical',
            loop: false,
        });
        $('.gallery-prev').on('click',function(e){
            e.preventDefault();
            self.mainGallerySwiper.slidePrev();
        });
        $('.gallery-next').on('click',function(e){
            e.preventDefault();
            self.mainGallerySwiper.slideNext();
        });
        this.mainGallerySwiper.on('slideChange',function(swiper){
            if(!self.thumbnailGallerySwiper) return;
            self.thumbnailGallerySwiper.slideTo(swiper.activeIndex);
            const activeSlide = swiper.slides[swiper.activeIndex];
            const activeSlideIndexKey = $(activeSlide).find('.gallery-main').data('index');
            $('.gallery-thumbnail.active').removeClass('active');
            $(".gallery-thumbnail[data-index='"+activeSlideIndexKey+"']").addClass('active');
        });
    }

    initGalleryThumbnails(){
        const self = this;
        if(window.innerWidth < 1024)
            return;
        this.thumbnailGallerySwiper = new Swiper('.single-product-header-gallery-thumbnails .swiper-wrapper-outer', {
            direction: 'vertical',
            loop: false,
            slidesPerView:'auto',
            spaceBetween:10,
            on: {
                click: function(swiper){
                    const clickedSlide = swiper.clickedSlide;
                    $('.gallery-thumbnail.active').removeClass('active');
                    $(clickedSlide).find('.gallery-thumbnail').addClass('active');
                    const index = $(clickedSlide).find('.gallery-thumbnail').data('index');
                    if(!self.mainGallerySwiper) return;
                    self.mainGallerySwiper.slideTo(index);
                }
            }
        });
    }

    initModalPreview(){
        const self = this;
        this.modalPreviewSwiper = new Swiper('.modal-gallery-preview-wrapper', {
            loop:true,
            on: {
                slideChange: function(swiper){
                    $('.modal-gallery-thumbnail.active').removeClass('active');
                    $('.modal-gallery-thumbnail[data-index="'+swiper.activeIndex+'"]').addClass('active');

                }
            }
        });
        $('.modal-gallery-preview-prev').on('click',function(e){
            e.preventDefault();
            self.modalPreviewSwiper.slidePrev();
        });
        $('.modal-gallery-preview-next').on('click',function(e){
            e.preventDefault();
            self.modalPreviewSwiper.slideNext();
        });
        $('.modal-gallery-thumbnail').on('click',function(e){
            e.preventDefault();
            $('.modal-gallery-thumbnail.active').removeClass('active');
            $(this).addClass('active');
            const index = $(this).data('index');
            self.modalPreviewSwiper.slideTo(index);
        });
    }

    disableAllVariants(){
        $('.variant-option input').attr('disabled',true);
        $('.variant-option').addClass('disabled');
    }
    enableAllVariants(){
        $('.variant-option input[disabled]').removeAttr('disabled');
        $('.variant-option.disabled').removeClass('disabled');
    }

    enableVariants(variantValues){
        variantValues.forEach(value => {
            const domElement = $(`input[value="${value}"]`);
            const parentDomElement = domElement.closest('.variant-option');
            domElement.removeAttr('disabled');
            parentDomElement.removeClass('disabled');
        });
    }

    handleSelecteds(){
        if(this.selecteds.length == $('.variant-options').length){
            this.variantAjax();
        }else{
            this.disableActions(false);
        }
        // Disable all variants and only enable available ones
        this.disableAllVariants();
        // Loop through all selected variants
        this.selecteds.forEach(selected => {
            // Find each selected in variantsMap array
            this.variantsMap.filter(variant => {
                // Checking if this is the first variant user is selecting
                // And if so, we do not disable the same variant group variants!!
                if(this.selecteds.length == 1){
                    // Finding the name of this variant group
                    const name = $(`input[value="${selected}"]`).attr('name');
                    // Finding those inputs with same name which indicates they are the same variant group
                    // And enabling them
                    $(`input[name="${name}"]:not([data-totally-disabled])`).removeAttr('disabled');
                    $(`input[name="${name}"]:not([data-totally-disabled])`).closest('.variant-option').removeClass('disabled');
                }
                return variant.includes(selected)}).forEach(value => {
                value.forEach(availableValue => {
                    // Enable option since it's available
                    $(`input[value="${availableValue}"]`).removeAttr('disabled');
                    $(`input[value="${availableValue}"]`).closest('.variant-option').removeClass('disabled');
                });
            });
        });
        if(!this.selecteds.length){
            // We enable all variants and run initVariants again to filter out those completely unavailable
            this.enableAllVariants();
            this.initVariants(true);
        }
    }

    removeVariantValueFromSelecteds(variantValue){
        const self = this;
        self.selecteds = self.selecteds.filter(v => v);
        delete self.selecteds[self.selecteds.indexOf(variantValue)]
        self.selecteds = self.selecteds.filter(v => v);
    }

    removeAllOptionsFromSameVariant(variantName){
        const self = this;
        // When user selects an option from same variant, the previous selected one should be removed from array
        $(`input[name="${variantName}"]`).each(function(){
            const variantValue = $(this).val();
            // This removes [empty] from array
            self.removeVariantValueFromSelecteds(variantValue);
        });
    }

    disableActions(withLoading){
        const productPriceWrapper = document.getElementById('product-price-wrapper');
        const addToBasketButton = $('.buy-action');
        addToBasketButton.addClass('disabled');
        addToBasketButton.attr('disabled', '');
        if(withLoading){
            addToBasketButton.addClass('fadeInOutLoading');
            productPriceWrapper.classList.add('fadeInOutLoading');
        }
    }
    enableActions(){
        const productPriceWrapper = document.getElementById('product-price-wrapper');
        const addToBasketButton = $('.buy-action');
        addToBasketButton.removeClass('fadeInOutLoading');
        addToBasketButton.removeClass('disabled');
        addToBasketButton.removeAttr('disabled');
        productPriceWrapper.classList.remove('fadeInOutLoading');
    }

    variantAjax(){
        const self = this;
        let _href = $('meta[name="basket_add_url"]').attr('content');
        const productHashid = $('meta[name="hashid"]').attr('content');
        const priceUnit = $('meta[name="price_unit"]').attr('content');
        const addToBasketButton = $('.buy-action');
        const productUnavailableTemplate = document.querySelector('template#product-unavailable');
        const productPriceTemplate = document.querySelector('template#product-price');
        const productBeforeDiscountPriceTemplate = document.querySelector('template#product-before-discount-price');
        const productPriceWrapper = document.getElementById('product-price-wrapper');
        $.ajax({
            url: `/shop/products/${productHashid}/variants/get-sku?values=` + this.selecteds.join(','),
            type: "GET",
            beforeSend: function() {
                self.disableActions();
            },
            success: function(response) {
                var product = response.data.product_sku;

                let price = '';
                if (!product.isAvailable) {
                    const unavailableElement = productUnavailableTemplate.content.cloneNode(true);
                    productPriceWrapper.innerHTML = '';
                    productPriceWrapper.appendChild(unavailableElement);
                } else if (product.discounted_status) {
                    const productBeforeDiscountElement = productBeforeDiscountPriceTemplate.content.cloneNode(true);
                    const priceElement = productPriceTemplate.content.cloneNode(true);

                    priceElement.querySelector('p').innerHTML = `${Util.numberWithCommas(product.discounted_price)} ${priceUnit}`;
                    productBeforeDiscountElement.querySelector('p').innerHTML = `${Util.numberWithCommas(product.price)}`;
                    productPriceWrapper.innerHTML = '';
                    productPriceWrapper.appendChild(productBeforeDiscountElement);
                    productPriceWrapper.appendChild(priceElement);
                } else {
                    const priceElement = productPriceTemplate.content.cloneNode(true);

                    priceElement.querySelector('p').innerHTML = `${Util.numberWithCommas(product.price)} ${priceUnit}`;
                    productPriceWrapper.innerHTML = '';
                    productPriceWrapper.appendChild(priceElement);
                }
                self.enableActions();

                _href = Util.updateQueryStringParameter(_href, 'sku_id', product.id);
                _href = Util.updateQueryStringParameter(_href, 'count', 1);
                addToBasketButton.attr('href',_href);
            },
            error: function() {
                const unavailableElement = productUnavailableTemplate.content.cloneNode(true);
                unavailableElement.querySelector('p').innerHTML = '<div><b>خطا! مجددا تلاش کنید</b></div>';
                productPriceWrapper.innerHTML = '';
                productPriceWrapper.appendChild(unavailableElement);

                self.enableActions();

                _href = Util.updateQueryStringParameter(_href, 'sku_id', '');
                addToBasketButton.attr('href',_href);
            },

        })
    }

    initVariantSelection(){
        const self = this;
        $(`.variant-option input`).on('change',function(){
            const variantValue = $(this).val();
            const variantName = $(this).attr('name');
            // Since radio buttons are deselectable we need to check if this is actually checked or unchecked
            // We trigger 'change' event manually when user deselects radio button
            if(this.checked){
                // Remove options from same variant
                self.removeAllOptionsFromSameVariant(variantName);
                self.selecteds.push(variantValue);
            }
            else{
                self.removeVariantValueFromSelecteds(variantValue);
            }
            self.handleSelecteds();
        });
    }

    initVariants(dontReinitialize){
        this.selecteds = [];
        // This array is a map of all available variants
        this.variantsMap = [];
        productVariants.forEach(variant => {
            variant.values.forEach(option => {
                const all = productVariants.filter(i => i.values.includes(option));
                const availables = all.filter(i => i.quantity != 0);
                // Option is not available at all
                // So deselect it completely in the dom
                if(!availables.length){
                    const variantOptionInDom = $(`input[value="${option}"]`).closest('.variant-option');
                    $(`input[value="${option}"]`).attr('disabled',true);
                    $(`input[value="${option}"]`).attr('data-totally-disabled',true);
                    variantOptionInDom.addClass('disabled');
                    variantOptionInDom.find('>span:first-child').text('ناموجود');
                }
            });

            if(variant.quantity != 0){
                this.variantsMap.push(variant.values);
            }
        });

        // Since we call this function after a page has initialized as well we need to check if it's first load or not
        if(!dontReinitialize)
            this.initVariantSelection();
    }
}

class BasketPage{
    constructor(){
        this.init();
    }

    handleProductCountChangeAjax(productId,action,variantId){
        $.ajax({
            url: URLS.syncBasketUrl,
            type: "POST",
            data:{
                _token:$('meta[name="csrf-token"]')?.attr('content'),
                sku_id:variantId,
                count: action
            },
            success: function(response) {
                location.reload();
            },
            error: function() {
                location.reload();
            }
        })
    }

    initCountBoxes(){
        const allCountBoxes = document.querySelectorAll('.count-wrapper');
        allCountBoxes.forEach(countBox => {


            const input = countBox.querySelector('input[type="hidden"]');
            var productId = input.dataset.id;
            var variantId = input.dataset.variantId;
            new CountBox(countBox, (newCount,action) => {
                const product = countBox.closest('[data-role="product"]');
                product.classList.add('fadeInOutLoading');
                this.handleProductCountChangeAjax(productId,action,variantId)
            });
        });
    }

    removeProductAjax(productId,variantId){
        $.ajax({
            url: URLS.syncBasketUrl,
            type: "POST",
            data:{
		    _token:$('meta[name="csrf-token"]')?.attr('content'),
		    sku_id:variantId,
                count:0
            },
            success: function(response) {
                location.reload();
            },
            error: function(xhr) {
		    console.log(xhr);

                //location.reload();
            }
        })
    }

    handleRemoveProduct(){
        const self = this;
        $('[data-remove="product"]').on('click',function(e) {
            e.preventDefault();
            const product = $(this).closest('[data-role="product"]');
            const productId = $(product).data('id');
            const variantId = $(product).attr('data-variant-id');
            console.log(variantId)

		const result = confirm('آیا از حذف محصول مطمئن هستید؟');
            if(result == true){
                product.addClass('fadeInOutLoading');
                self.removeProductAjax(productId,variantId);
            }
        });
    }

    fetchReservedForAddress(addressId){
        return new Promise((resolve,reject) => {
            $.ajax({
                url: URLS.checkReservedUrl,
                type: "GET",
                data: {
                    "addressId": addressId
                },
                success: function(response) {
                    resolve(response);
                }
            });
        });
    }

    fetchTransportOptions(city){
        return new Promise((resolve,reject) => {
            $.ajax({
                url: URLS.transportMethodUrl.replace(':id',city),
                type: 'GET',
                data:{
                    check:1
                },
                success: function(response) {
                    resolve(response);
                },
                error: function(error){
                    reject(error);
                }
            })
        });
    }

    async handleReserved(addressId){
        const response = await this.fetchReservedForAddress(addressId);
        if(response.data.has_reserved_order){
            $('aside').prepend(`
                <p class="alert alert-warning mb-2 p-3 rounded">
                    شما روی آدرس انتخاب‌شده یک سفارش رزرو دارید. <br/>این سفارش نیز به رزرو قبلی شما اضافه می‌شود.
                </p>
            `);
            $('input[name="hasReservedOrder"]').val(1);
            alert('محصولات این سفارش به سفارش رزرو شده منتقل شده است');
        }else{
            $('input[name="hasReservedOrder"]').val(0);
        }
    }

    async handleTransportMethods(city){
        if(!city) return;
        $('aside').addClass('fadeInOutLoading');
        const response = await this.fetchTransportOptions(city).catch(error => {
            console.error(error);
            alert('خطایی رخ داد')
        });
        let data = response.data

        this.renderTransportMethods(data)
        console.log(data,'this is data')

        $('aside').removeClass('fadeInOutLoading');
    }

    renderTransportMethods(data) {
        var transportMethods = '';

        $.each(data.transport_methods, function(key, value) {

            transportMethods += `
                        <div class="big-radio">
                                <input form="setAddress" ${data.disable_post ? 'disabled' : ''}  type="radio" name="transport_way"  value="${key}"/>
                                    <label>
                                        <div class="big-radio-right">
                                            <p class="mb-1 fw-bold">${value.title}</p>
                                            <p class="m-0">${value.price === 0 ? 'رایگان': value.price}</p>
                                             <p class="m-0">${value.description}</p>
                                        </div>
                                        <div class="big-radio-left">
                                            <span>
                                                <img src="/assets/new/icons/check-white.svg" alt="Check icon" />
                                            </span>
                                        </div>
                                    </label>
                                </div>
                `
        });
        $('#transport-options p').remove();
        $('#transport-options').html(transportMethods)
    }

    handleAddressChange(){
        const self = this;
        $('input[name="address_id"]').each(function(){
            $(this).on('change', function(e){
                const selectedAddress = $('input[name="address_id"]:checked');
                const city = $(this).data('city');
                const addressId = selectedAddress.data('id');
                self.handleReserved(addressId);
                self.handleTransportMethods(city);
            });
        });
    }

    activateButton(){
        $('[data-submit]').removeClass('disabled');
        $('[data-submit]').removeAttr('disabled');
    }

    deactivateButton(){
        $('[data-submit]').addClass('disabled');
        $('[data-submit]').attr('disabled',true);
    }

    handleAnyRadioChange(){
        const self = this;
        const allFieldSetsLength = $('fieldset').length;
        $(document).on('change','input[type="radio"]', function(e){
            const allSelectedRadios = $('input[type="radio"]:checked');
            if(allSelectedRadios.length == allFieldSetsLength){
                self.activateButton();
            }
            else{
                self.deactivateButton();
            }
        });
    }

    applyDiscountAjax(){
        let newUrl = URLS.applyDiscount;
        const code = $("input[name='code']").val();
        const order = $('.discount-check').data('id');
        const csrfToken = $('meta[name="csrf-token"]')?.attr('content');
        if(!csrfToken) return;
        newUrl = newUrl.replace(':id', order).replace(':coupon', code);

        $.ajax({
            url: newUrl,
            type: "post",
            beforeSend: function() {
                $('.promo-code-wrapper').addClass('fadeInOutLoading');
                // $('.discount-check').html('درحال بروزرسانی . . .')
            },
            data: {
                "_token": csrfToken
            },
            success: function(response) {
                $('.promo-code-wrapper').removeClass('fadeInOutLoading');
                $('.coupon').css('display', 'none');
                $('.discount-check').html('اعمال')
                $('.promo-code-wrapper').addClass('active');
                $('.promo-code-wrapper a').text('حذف کد تخفیف');
                var discount =
                    '<div class="d-flex align-items-center justify-content-between px-4 mt-4" id="discountCodeDiv">' +
                    '<span>کد تخفیف: <strong class="text-success">' + response.data.code +
                    '</strong><a href="#" class=" trashDiscountCode" title="حذف کد تخفیف"> <i class="fa fa-times text-danger"> </i></a></span>' +
                    '<strong class="text-success">' +
                    response.data.discount_amount +
                    '</strong>' +
                    '</div>';
                $(discount).insertAfter('#transport-div');
                $('.coupon').append('<input type="hidden" name="discount_code" value="' +
                    response.data.code + '">')
                $("input[name='code']").val('');
                $('#totalPrice').html(response.data.total_remain);
            },
            error: function(xhr, status, error) {
                $('.promo-code-wrapper').removeClass('fadeInOutLoading');
                $('.discount-check').html('اعمال');
                $("input[name='code']").val('');
                const message = '<span>' + JSON.parse(xhr.responseText).meta.status.messages[0] +
                    '</span>';
                $('#discount-status').html($(message).removeClass('d-none').addClass(
                    'text-danger').delay(8000).fadeOut(250));
                $('html, body').animate({
                    scrollTop: 0
                }, 800);
            },
        });
    }

    handleDiscount(){
        const self = this;
        $(document).on('click touch','.discount-check',function(e){
            self.applyDiscountAjax();
        });
    }

    handleDefaultAddress(){
        $('input[type="radio"]:checked').trigger('change');
    }

    init(){
        this.initCountBoxes();
        this.handleRemoveProduct();

        if($('body').hasClass('info-verify')){
            this.handleTransportMethods();
            this.handleAddressChange();
            this.handleAnyRadioChange();
            this.handleDefaultAddress();
            return;
        }
        if($('body').hasClass('payment-way')){
            this.handleDiscount();
        }
    }
}

class CountBox{
    constructor(element,onChangeCallback){
        this.countBox = element;
        this.hiddenInput = element.querySelector('input[type="hidden"]');
        this.indicatorSpan = element.querySelector('span[data-count-indicator]');
        this.increaseButton = element.querySelector('button[data-count-increase]');
        this.decreaseButton = element.querySelector('button[data-count-decrease]');
        this.maxValue = parseInt(element.dataset.max || 1000);
        this.minValue = parseInt(element.dataset.min || 1);
        this.currentValue = parseInt(this.hiddenInput.value || 0);
        this.callback = onChangeCallback;

        this.init();
    }

    updateIndicator(){
        if(this.currentValue >= this.maxValue){
            this.disableButton(this.increaseButton);
        }else{
            this.enableButton(this.decreaseButton);
        }
        if(this.currentValue <= this.minValue){
            this.disableButton(this.decreaseButton);
        }else{
            this.enableButton(this.decreaseButton);
        }
        this.indicatorSpan.innerHTML = this.currentValue;
    }

    disableButton(element){
        element.classList.add('disabled');
        element.setAttribute('disabled',true);
    }
    enableButton(element){
        element.classList.remove('disabled');
        element.removeAttribute('disabled');
    }

    handleIncreaseButton(){
        const self = this;

        this.increaseButton.addEventListener('click', function(e){
            e.preventDefault();

            if(self.currentValue < self.maxValue){
                self.currentValue += 1;
                self.hiddenInput.value = self.currentValue;
                self.updateIndicator();
                if(typeof self.callback !== 'undefined')
                    self.callback(self.currentValue,1);
            }
        });
    }
    handleDecreaseButton(){
        const self = this;

        this.decreaseButton.addEventListener('click', function(e){
            e.preventDefault();

            if(self.currentValue > self.minValue){
                self.currentValue -= 1;
                self.hiddenInput.value = self.currentValue;
                self.updateIndicator();
                if(typeof self.callback !== 'undefined')
                    self.callback(self.currentValue,-1);
            }
        });
    }

    init(){
        this.handleIncreaseButton();
        this.handleDecreaseButton();
        this.updateIndicator();
    }
}

class Address{
    constructor(){
        this.initialSelectedCity = null;
        this.init();
    }

    getProvinceCities(provinceId){
        return new Promise((resolve,reject) => {
            $.ajax({
                type: "GET",
                url: URLS.provinceCities + "?province_id=" + provinceId,
                success: function (response) {
                    resolve(response);
                }
            });
        });
    }

    handleProvinceChange(){
        const self = this;

        $(document).on('change','[data-province]',async function(e){
            const citySelect = $(this).closest('[data-address]').find('[data-city]');
            citySelect.parent().addClass('fadeInOutLoading');
            if(!citySelect) return;
            const provinceId = $(this).val();
            const citiesResponse = await self.getProvinceCities(provinceId);
            citySelect.parent().removeClass('fadeInOutLoading');
            const cities = citiesResponse.cities;
            citySelect.html('');
            cities.forEach(city => {
                if(self.initialSelectedCity && city.id == self.initialSelectedCity){
                    citySelect.append(`<option selected value="${city.id}">${city.name}</option>`);
                }else{
                    citySelect.append(`<option value="${city.id}">${city.name}</option>`);
                }
            });
        });
    }

    handleRemoveAddress(){
        $('[data-remove="address"]').on('click',function(e){
            e.preventDefault();
            const result = confirm('آیا از حذف این آدرس اطمینان دارید؟');
            const csrfToken = $('meta[name="csrf-token"]').attr('content');
            if(!csrfToken) return;
            if(result){
                const address = $(this).closest('[data-address]');
                if(!address) return;
                address.addClass('fadeInOutLoading');
                const removeUrl = address.find('[data-name="remove-address-url"]')?.val();
                if(!removeUrl) return;
                $.ajax({
                    url: removeUrl,
                    method:'delete',
                    headers:{
                        "X-CSRF-TOKEN": csrfToken
                    },
                    success: function(response) {
                        location.reload();
                    },
                    error: function() {
                        location.reload();
                    }
                })
            }
        });
    }

    defaultAddressAjax(id){
        $.ajax({
            url: "/panel/profile/addresses/" + id + "/default-address",
            type: "POST",
            headers:{
                "X-CSRF-TOKEN": Util.getCsrfToken()
            },
            success: function(response) {
                location.reload();
            }
        })
    }

    handleDefaultAddress(){
        const self = this;
        $(document).on('click','[data-action="default-address"]',function(e){
            e.preventDefault();
            const addressId = $(this).data('id');
            self.defaultAddressAjax(addressId);
        });
    }

    handleEditAddress(){
        const self = this;
        $('[data-address] [data-action="edit"]').on('click',function(e){
            e.preventDefault();
            const modal = $('#editAddressModal');
            const id = $(this).data('id');
            modal.find('.modal-content').load('/panel/profile/addresses/' + id, '', function () {
                self.initialSelectedCity = $(modal).find('[data-city]').attr('data-id');
                App.initSelect2();
                $(modal).find('[data-province]').trigger('change');
                modal.modal('show');
            })
        });
    }

    init(){
        this.handleProvinceChange();
        this.handleRemoveAddress();
        this.handleEditAddress();
        this.handleDefaultAddress();
    }
}

class OrderPage{
    constructor(){
        this.init();
    }

    removeProductAjax(orderId,productId){
        let newUrl = URLS.removeProductFromOrder;
        newUrl = newUrl.replace(':id', orderId).replace(':product_id', productId);
        $.ajax({
            url: newUrl,
            type: 'DELETE',
            data: {
                '_token': document.getElementsByName('csrf-token')[0].getAttribute('content'),
            },
            success: function (response) {
                location.reload();
            },
            error: function (xhr, status, error) {
                var errors = JSON.parse(xhr.responseText);
                var e = errors.meta.status.messages;
                for (message in e) {
                    alert(e[message]);
                }
            }
        })
    }

    handleRemoveProduct(){
        const self = this;
        $('[data-remove="product"]').each(function(){
            $(this).on('click touch', function(e){
                e.preventDefault();
                const result = confirm("آیا از حذف این محصول مطمئن هستید؟");
                if(result){
                    $(this).closest('[data-role="product"]').addClass('fadeInOutLoading');
                    const productId = $(this).attr('data-variant-id');
                    const orderId = $(this).attr('data-order-id');
                    self.removeProductAjax(orderId,productId);
                }
            });
        });
    }

    applyCouponAjax(orderId,couponCode){
        let newUrl = URLS.applyCouponOrder;
        newUrl = newUrl.replace(':id', orderId).replace(':coupon', couponCode);
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        $.ajax({
            url: newUrl,
            type: "post",
            data: {
                "_token": csrfToken,
                "type":"order"
            },
            beforeSend: function() {
                $('.discount-check').html('درحال بروزرسانی . . .')
            },
            success: function(response) {
                $('.discount-check').html('اعمال')
                let payLink = $('#PayLink').attr('href');
                payLink = payLink + `&discount_code=${response.data.code}`;
                $('#PayLink').attr('href', payLink);
                $('#PayLink > span').html(`پرداخت (${response.data.total_remain})`)

                var discount = '<div class="row">' +
                    '<div class="col-md-12 text-danger">توجه داشته باشید در صورت تایید و اعمال کد تخفیف دیگر قادر به بازگردانی آن نیستید</div>' +
                    '<div class="col-md-12">' +
                    '<table class="table">' +
                    '<tr>' +
                    '<td>کد تخفیف</td>' +
                    '<td> مبلغ تخفیف</td>' +
                    '<td>مبلغ سفارش بعد از تخفیف</td>' +
                    '</tr>' +
                    '<tr>' +
                    '<td>' + response.data.code + '</td>' +
                    '<td>' + response.data.discount_amount + '</td>' +
                    '<td>' + response.data.total_remain + '</td>' +
                    '</tr>' +
                    '</table>' +
                    '</div>' +
                    '</div>';

                $('#coupon-pre').html(discount);
                $("input[name='code']").val('');
            },
            error: function(xhr, status, error) {
                $('.discount-check').html('اعمال');
                $("input[name='code']").val('');
                let message = '<span>' + JSON.parse(xhr.responseText).meta.status.messages[0] +
                    '</span>';
                $('#discount-status').html($(message).removeClass('d-none').addClass(
                    'text-danger').fadeOut(8000));
                $('html, body').animate({
                    scrollTop: 0
                }, 800);
            }
        });
    }

    handleCoupon(){
        const self = this;
        $('.discount-check').on('click',function(e){
            e.preventDefault();
            const orderId = $(this).data('id');
            const couponCode = $('input[name="code"]').val();
            self.applyCouponAjax(orderId,couponCode);
        });
    }

    cancelOrderAjax(){
        $.ajax({
            url: URLS.cancelOrder,
            type: "post",
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            success: function(response) {
                location.reload();
            },
            error: function(xhr, status, error) {
                location.reload();
            }
        });

    }

    handleCancelOrder(){
        const self = this;
        $('#cancelOrder').on('click',function(e){
            e.preventDefault();
            if(!URLS.cancelOrder) return;
            const result = confirm("آیا از لغو سفارش اطمینان دارید؟");
            if(result){
                $('.single-order-details').addClass('fadeInOutLoading');
                self.cancelOrderAjax();
            }
        });
    }

    handleUseWalletCredit(){
        $('input[name="use_wallet"]').on('change', function(){
            const payLink = $('[data-pay-link]');
            let href = payLink.attr('href');
            let url = new URL(href);
            let searchParams = url.searchParams;

            if(this.checked){
                searchParams.set('use_wallet','1');
            }else{
                searchParams.delete("use_wallet");
            }
            url.search = searchParams.toString();
            url = url.toString();
            payLink.attr('href',url);
        });
    }

    init(){
        this.handleRemoveProduct();
        this.handleCoupon();
        this.handleCancelOrder();
        this.handleUseWalletCredit();
    }
}

class FileInput{
    constructor(element){
        this.element = element;
        this.init();
    }
    handleChange(){
        $(this.element).on('change', function(e){
            const fileName = e.target.files[0].name;
            $(this).closest('.file-input').find('[data-file-name] span').html(fileName);
        });
    }
    init(){
        this.handleChange();
    }
}

class ProductsPage{
    constructor(){
        this.filters = {
            categories:[],
            attributes:{}
        };
        this.viewType = "column";
        this.priceUnit = $('meta[name="price-unit"]').attr('content');
        this.mainCategoryId = document.querySelector('meta[name="main-category"]')?.getAttribute('content') || null
        this.init();
    }

    numberFormat(input) {
        input = "" + input;
        return new Intl.NumberFormat("ja-JP", {
            currency: "JPY",
        }).format(input);
    }
    setFiltersFromURL(){
        const quantity = Util.getParameterByName('quantity') || undefined;
        const priceRange = Util.getParameterByName('priceRange') || undefined;
        const categories = Util.getParameterByName('categories') || this.mainCategoryId;
        const searchQuery = Util.getParameterByName('search_key') || undefined;
        const page = Util.getParameterByName('page') || 1;
        const sort = Util.getParameterByName('sort') || 'published_at';
        const sortType = Util.getParameterByName('sortType') || 'desc';


        this.filters = {
            quantity:quantity,
            priceRange:priceRange,
            categories:categories,
            page:page,
            searchQuery:searchQuery,
            sort:sort,
            sortType:sortType,
        };
    }
    getCategoriesFromUI(){
        const newCategories = [];
        const checkedCategoriesLength = $('[data-filter="category"]:checked').length;
        if(checkedCategoriesLength){
            $('[data-filter="category"]:checked').each(function(){
                newCategories.push($(this).val());
            });
        }
        else if(this.mainCategoryId){
            newCategories.push(this.mainCategoryId);
        }
        this.filters.categories = newCategories;
    }
    getQuantityStatusFromUI(){
        const quantityStatusElement = document.querySelector('[data-filter="quantity"]');
        if(quantityStatusElement.checked){
            // Should only show available products
            this.filters.quantity = 1;
        }else{
            // Should show all products
            this.filters.quantity = 2;
        }
    }
    getPriceRangeFromUI(){
        const priceRangeSlider = document.querySelector('[data-range-input]');
        const values = priceRangeSlider.noUiSlider.get();
        // + before values converts string to number in javascript!
        const fromValue = +values[0];
        const toValue = +values[1];
        this.filters.priceRange = fromValue + ";" + toValue;
    }
    getSortField(){
        const sortField = $('[data-filter="sort-field"][data-active]').data('id');
        this.filters.sort = sortField || 'published_at';
    }
    getSortType(){
        const sortType = $('[data-filter="sort-type"][data-active]').data('type') || 'desc';
        this.filters.sortType = sortType;
    }
    setFiltersFromUI(){
        this.getCategoriesFromUI();
        this.getQuantityStatusFromUI();
        this.getPriceRangeFromUI();
        this.getSortField();
        this.getSortType();
        this.setAttributesFromUI();
    }
    setSearchUIFromURL(){
        if(this.filters.searchQuery){
            $('[data-search-input]').val(this.filters.searchQuery);
        }
    }
    handleSortTypeClick(){
        const self = this;
        $('[data-filter="sort-type"]').on('click',function(e){
            e.preventDefault();
            const isActive = $(this).data('active');
            if(isActive)
                return;
            $('[data-filter="sort-type"][data-active]').removeAttr('data-active');
            $(this).attr('data-active',true);
            self.filters.sortType = $(this).data('type');
            self.filters.sort = $(this).data('field');
            self.setFiltersInURL();
            self.getProductsAjaxAndUpdateUI();
        });
    }
    setFiltersInURL(){
        Url.removeQuery();
        Url.updateSearchParam('categories',this.filters.categories,true);
        Url.updateSearchParam('priceRange',this.filters.priceRange || undefined,true);
        Url.updateSearchParam('quantity',this.filters.quantity,true);
        Url.updateSearchParam('sort',this.filters.sort,true);
        Url.updateSearchParam('sortType',this.filters.sortType,true);
        Object.keys(this.filters.attributes).forEach((key) => {
            const attributeValue = this.filters.attributes[key];
            Url.updateSearchParam(`attributes[${key}]`,attributeValue,true);
        });
        // this.filters.attributes.forEach((attribute,key) => {
        //     Url.updateSearchParam(`attributes[${key}]`,attribute,true);
        // });
        Url.updateSearchParam('page',1);
    }
    setFilterInURL(key,value){
        Url.updateSearchParam(key,value,true)
    }
    handleFilterSubmit(){
        const self = this;
        $('[data-action="filters-submit"]').on('click',async function(e){
            e.preventDefault();
            self.setFiltersFromUI();
            self.setFiltersInURL();
            self.getProductsAjaxAndUpdateUI();
        });
    }
    handleAttributesChange(){
        const self = this;
        $(document).on('change','input[name="attributes"]', function(){
            const attributeId = this.dataset.parent;
            const value = this.value;

            if(this.checked){
                if(typeof self.filters.attributes === 'undefined')
                    self.filters.attributes = {};
                if(self.filters.attributes[attributeId])
                    self.filters.attributes[attributeId].push(value);
                else
                    self.filters.attributes[attributeId] = [value];
            }else{
                const index = self.filters.attributes[attributeId].findIndex(i => i == value);
                delete self.filters.attributes[attributeId][index];
                self.filters.attributes[attributeId] = self.filters.attributes[attributeId].filter(v => v);
            }

        });
    }
    handleFilterAvailableChange(){
        const self = this;
        $('[data-filter="quantity"]').on('change', function(e){
            self.getQuantityStatusFromUI();
            self.setFiltersInURL();
            self.getProductsAjaxAndUpdateUI();
        });
    }
    updatePriceRangeActiveFiltersUI(){
        const minPriceRange = Number($('[data-range-input]').data('min'));
        const maxPriceRange = Number($('[data-range-input]').data('max'));
        const isPriceRangeActive = !!this.filters.priceRange;
        if(!isPriceRangeActive) return;
        if(this.filters.priceRange?.split(';')[0] != minPriceRange || this.filters.priceRange?.split(';')[1] != maxPriceRange){
            $('#active-filters').append(`
                <div class="border-light rounded px-3 py-2">
                    <span>از ${Number(this.filters.priceRange.split(';')[0]).toLocaleString()} ${this.priceUnit} تا ${Number(this.filters.priceRange.split(';')[1]).toLocaleString()} ${this.priceUnit}</span>
                    <a href="javascript:;" title="" target="_self" data-role="priceRange" class="me-2">
                        <img src="/assets/new/icons/remove-filter.svg" alt="Remove filter" />
                    </a>
                </div>
            `);
        }
    }
    updateQuantityActiveFiltersUI(){

        if(this.filters.quantity == 2){
            $('#active-filters').append(`
                <div class="border-light rounded px-3 py-2">
                    <span>${this.filters.quantity == 1 ? "تمام محصولات" : "فقط محصولات موجود"}</span>
                    <a href="javascript:;" title="" target="_self" data-role="quantity" class="me-2">
                        <img src="/assets/new/icons/remove-filter.svg" alt="Remove filter" />
                    </a>
                </div>
            `);
        }
    }
    updateAttributesActiveFiltersUI(){
        $('input[name="attributes"]:checked').each(function(){
            const title = $(this).attr('data-title');
            const attributeTitle = $(this).attr('data-attribute-title');
            const attributeId = $(this).data('parent');
            const value = $(this).val();
            $('#active-filters').append(`
                <div class="border-light rounded px-3 py-2">
                    <span>${title} ${attributeTitle}</span>
                    <a href="javascript:;" title="" target="_self" class="me-2" data-role="attributes" data-id="${attributeId}" data-value="${value}">
                        <img src="/assets/new/icons/remove-filter.svg" alt="Remove filter" />
                    </a>
                </div>
            `);
        });
    }
    handleRemoveAllFilters(){
        const self = this;
        $('[data-role="remove-all-filters"]').on('click',function(e){
            e.preventDefault();
            self.filters = {
                categories:[self.mainCategoryId],
                attributes:{}
            };
            self.setFiltersInURL();
            window.location.reload();
        });
    }
    handleEmptyActiveFiltersUI(){
        if(!$('#active-filters').children().length){
            $('#active-filters').append(`<p class="text-center text-muted mx-auto">فیلتری اعمال نشده است</p>`);
        }
    }
    updateActiveFiltersUI(){
        $('#active-filters').html('');
        this.updatePriceRangeActiveFiltersUI();
        this.updateQuantityActiveFiltersUI();
        this.updateAttributesActiveFiltersUI();
        this.handleEmptyActiveFiltersUI();
    }
    handlePagination() {
        const self = this;
        $(document).on('click','.pagination a ',function (event) {
            event.preventDefault();
            $(this).addClass('active');

            const url = new URL($(this).attr('href'), window.location.origin);
            const clickedPage = url.searchParams.get('page');
            self.filters.page = Number(clickedPage);
            Url.updateSearchParam('page', self.filters.page);
            self.getProductsAjaxAndUpdateUI();
        })
    }
    handleDeleteActiveFiltersClick(){
        const self = this;
        this.handleRemoveAllFilters();
        $(document).on('click','#active-filters a',function(e){
            e.preventDefault();

            const role = $(this).data('role');
            if(role != 'attributes'){
                self.filters[role] = undefined;
                return;
            }
            // This section is for handling attributes ONLY
            const attributeId = $(this).data('id');
            const value = $(this).data('value');
            const index = self.filters.attributes[attributeId].findIndex(i => i == value);
            delete self.filters.attributes[attributeId][index];
            self.filters.attributes[attributeId] = self.filters.attributes[attributeId].filter(v => v);
            $(`input[name="attributes"][data-parent="${attributeId}"][value="${value}"]`).trigger('click');
            self.setFiltersInURL();
            self.getProductsAjaxAndUpdateUI();
            $(this).remove();
        });
    }
    async getProductsAjaxAndUpdateUI(){
        if(window.innerWidth < 1024){
            this.updateActiveFiltersMobileBadge();
        }
        this.updateActiveFiltersUI();
        $('[data-products]').addClass('fadeInOutLoading');
        const result = await this.getProductsAjax();
        this.updateProductsUI(result);
        $('[data-products]').removeClass('fadeInOutLoading');
    }
    updateActiveFiltersMobileBadge(){
        let activeFilters = [];
        const minPriceRange = Number($('[data-range-input]').data('min'));
        const maxPriceRange = Number($('[data-range-input]').data('max'));
        if(this.filters.attributes.length){
            activeFilters.push([...this.filters.attributes]);
        }
        if(this.filters.priceRange && (this.filters.priceRange.split(';')[0] != minPriceRange || this.filters.priceRange.split(';')[1] != maxPriceRange)){
            activeFilters.push(this.filters.priceRange);
        }

        $('.mobile-active-filters-count').text(activeFilters.length);
    }
    updateProductsUI(response){
        const data = response.data;
        const products = data.products;
        const pagination = [];
        const paginate = products.links;
        const priceUnit = document.querySelector('meta[name="price-unit"]')?.getAttribute('content') || '-';
        $('[data-products]').html('');
        for (let i = 1; i < paginate.length - 1; i++) {
            let url = paginate[i].url;
            let label = paginate[i].label;
            const is_active = paginate[i].active ? 'active' : '';
            pagination.push(`<a class="item ${is_active}" href="${url}" aria-current="page">${label}</a>`);
        }
        products.data.forEach(product => {
            let priceSection = '';
            let discountPercent = '';
            let previewImages = '';

            if (product.product_quantity !== 0) {
                if (!!product.discounted_status) {
                    priceSection = `<span class="text-muted product-before-discount persian-number">${Util.numberWithCommas(product.price)}</span>`;
                }
                priceSection += `<strong class="text-primary persian-number">${product.discounted_status ? Util.numberWithCommas(product.discounted_price) : Util.numberWithCommas(product.price)}</strong>`;
                priceSection += `<span class="text-muted">${priceUnit}</span>`;
            } else {
                priceSection = `<strong class="text-muted">ناموجود</strong>`;
            }

            if (product.product_quantity !== 0 && product.discounted_status) {
                const discountPercentage = ((product.discounted_price * 100) / product.price);
                discountPercent = `<span class="product-discount persian-number">${product.discount_percent_price} درصد</span>`;
            }

            if (!!product.files && product.files.length && !!product.image) {
                previewImages = '<div class="product-image-gallery">';
                for (let i = 0; i < Math.min(3, product.files.length); i++) {
                    previewImages += `<div class="product-image-gallery-item">
                                            <img src="${product.files[i].fileurl.thumbnail}" alt="${product.title}"/>
                                        </div>`;
                }
                previewImages += '</div>';
            }
            const productStruct = `
            <div class="col-lg-3 col-sm-12 py-4">
                <a href="${product.url}" target="_self" class="product">
                    <div class="product-image">
                        <div class="product-image-meta">
                            <span class="product-like">
                                <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M15.8743 4C19.0493 4 21.1783 6.98 21.1783 9.755C21.1783 15.388 12.3393 20 12.1783 20C12.0173 20 3.17834 15.388 3.17834 9.755C3.17834 6.98 5.30734 4 8.48234 4C10.2973 4 11.4893 4.905 12.1783 5.711C12.8673 4.905 14.0593 4 15.8743 4Z" stroke="#323232" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </span>
                            ${discountPercent}
                        </div>
                        <img src="${product.image ? product.image_urls.url : '/assets/images/ibolakplaceholder.jpg'}" />
                        ${previewImages}
                    </div>
                    <div class="product-body d-flex justify-content-between">
                        <div class="product-body-right">
                            <div class="d-flex align-items-center product-categories">
                                ${product.main_category ? product.main_category[0].title : ''}
                            </div>
                            <strong class="product-title">${product.title}</strong>
                        </div>
                        <div class="product-body-left">
                            ${priceSection}
                            <div class="product-discount horizontal persian-number">${product.discount_percent_price} درصد</div>
                        </div>
                    </div>
                </a>
            </div>
            `;
            $('[data-products]').append(productStruct);
        });
        $('[data-products]').append('<div class="pagination-wrapper"><div class="ui pagination menu" role="navigation"></div></div>')
        $('.pagination-wrapper .pagination ').html(pagination)
        if(!products.data.length){
            const emptyString = `<div class="d-flex align-items-center justify-content-center flex-column my-5 text-center">
            <img src="/assets/new/icons/empty-hanger.svg" alt="Empty icon" />
            <p class="text-center mt-5 mb-0 font-weight-bold fs-3 d-block w-100">محصولی یافت نشد!</p>
            <p class="text-center mt-0 font-weight-bold fs-6 text-muted d-block w-100">مجددا جستجو نمایید</p>
        </div>`;
            $('[data-products]').append(emptyString);
        }
        $('html').animate({scrollTop:0},100);
        this.handleProductStyle();
    }
    handleProductStyle(){
        if(this.viewType == 'row'){
            $('[data-products]').attr('data-row-view',true);
            $('[data-products] .col-lg-3.py-4').removeClass('py-4');
            $('[data-products] .col-lg-3').addClass('col-lg-6 py-2');
            $('[data-products] .product').addClass('horizontal');
            $('.mobile-only .product-type').attr('data-target','column');
            $('.mobile-only .product-type img').attr('src',$('.mobile-only .product-type img').attr('data-column-src'));
        }else{
            $('[data-products]').removeAttr('data-row-view');
            $('[data-products] .col-lg-3.col-lg-6').removeClass('col-lg-6');
            $('[data-products] .col-lg-3.py-2').removeClass('py-2');
            $('[data-products] .col-lg-3').addClass('py-4');
            $('[data-products] .product.horizontal').removeClass('horizontal');
            $('.mobile-only .product-type').attr('data-target','row');
            $('.mobile-only .product-type img').attr('src',$('.mobile-only .product-type img').attr('data-row-src'));
        }
    }
    handleProductType(){
        const self = this;
        $('.product-type').on('click',function(e){
            e.preventDefault();
            self.viewType = $(this).attr('data-target');
            $(this).parent().find('.product-type[data-active]').removeAttr('data-active');
            $(this).attr('data-active',true);
            self.handleProductStyle();
        });
    }


    getProductsAjax(){
        const filters = this.filters;
        return new Promise((resolve,reject) => {
            $.ajax({
                url:URLS.searchProducts,
                type: 'GET',
                data: {
                    'category_ids':filters.categories,
                    'availability':filters.quantity,
                    'price': filters.priceRange,
                    'page': filters.page,
                    'perPage':filters.perPage,
                    'sort_field': filters.sort,
                    'sort_type': filters.sortType,
                    'attributes': filters.attributes,
                    'search_key': filters.searchQuery,
                },
                success: function(response){
                    resolve(response);
                    // changeProductShowMode(getCurrentProductShowMode());
                },
                error: function(error){
                    reject(error);
                }
            });
        });
    }
    setAttributesFromUI(){
        const attributes = document.querySelectorAll('input[name="attributes"]:checked');
        this.filters.attributes = {};
        attributes.forEach(attribute => {
            const attributeId = $(attribute).data('parent');
            const value = $(attribute).val();
            if(this.filters.attributes[attributeId]){
                this.filters.attributes[attributeId].push(value);
            }else{
                this.filters.attributes[attributeId] = [value];
            }
        });
    }
    handleMobile(){
        $('.mobile-filters-toggle').on('click',function(e){
            e.preventDefault();
            $('body').append('<div class="backdrop"></div>');
            $(document).on('click','.backdrop',function(e){
                $('#filters-wrapper').removeClass('active');
                $(this).remove();
            })
            $('#filters-wrapper').addClass('active');
        });

        $('.mobile-sort-toggle').on('click',function(e){
            e.preventDefault();
            $('body').append('<div class="backdrop"></div>');
            $(document).on('click','.backdrop',function(e){
                $('.sort-types').removeClass('active');
                $(this).remove();
            })
            $('.sort-types').addClass('active');
        });

        $('[data-action="filters-submit"]').on('click', function(e){
            $('.backdrop').remove();
            $('#filters-wrapper').removeClass('active');
        });

        $('[data-filter="sort-type"]').on('click', function(e){
            $('.backdrop').remove();
            $('.sort-types').removeClass('active');
        });
    }
    init(){
        this.setFiltersFromURL();
        this.setSearchUIFromURL();
        this.setAttributesFromUI();
        // this.getProductsAjaxAndUpdateUI();
        this.handleAttributesChange();
        this.handleDeleteActiveFiltersClick();
        this.handleProductType();
        this.handlePagination();

        this.handleSortTypeClick();
        this.handleFilterAvailableChange();

        this.handleFilterSubmit();

        this.handleMobile();
    }
}

class Mobile{
    constructor(){
        this.isHomepage = document.body.classList.contains('home-page');
        this.isSingleProduct = document.body.classList.contains('single-product-page');
        this.initCollapsibles();
        this.initMobileTabs();
        this.handleHeaderBackBtn();

        if(this.isHomepage){
            this.initHome();
        }
        if(this.isSingleProduct){
            this.initSingleProduct();
        }
    }

    handleHeaderBackBtn(){
        $('.mobile-back').on('click',function(e){
            e.preventDefault();
            window.history.back();
        });
    }

    initSingleProduct(){
        this.initGalleryDots();
    }

    initMobileTabs(){
        const self = this;
        $('[data-toggle="mobile-tab"]').on('click',function(e){
            if(!self.lastActiveTab)
                self.lastActiveTab = $('.mobile-tabs a.active:not([data-toggle="mobile-tab"])');
            $(this).toggleClass('active');
            self.lastActiveTab.toggleClass('active');
        });
    }

    initGalleryDots(){
        const galleryElement = document.querySelector('.single-product-header-gallery');
        galleryElement.swiper.on('slideChange',function(swiper){
            const activeSlideIndex = swiper.activeIndex;
            $('.single-product-header-gallery-pagination span.active').removeClass('active');
            $('.single-product-header-gallery-pagination span:nth-child('+(activeSlideIndex+1)+')').addClass('active');
        })
        const allSlidesCount = $('.single-product-header-gallery .swiper-slide').length;
        Array(allSlidesCount).fill(1).forEach((_,index) => {
            if(index == 0 ){
                $('.single-product-header-gallery-pagination').append('<span class="active"></span>');
                return;
            }
            $('.single-product-header-gallery-pagination').append('<span></span>');
        });
    }

    initCollapsibles(){
        $('[data-collapsible-header]').on('click',function(e){
            e.preventDefault();
            const collapsible = $(this).closest('[data-collapsible]');
            collapsible.toggleClass('active');
            collapsible.find('[data-collapsible-body]').slideToggle(200)
        });
    }

    initHome(){
        const allSlidesCount = $('.mobile-hero .swiper-wrapper .swiper-slide').length;
        const swiper = new Swiper('.mobile-hero', {
            loop: false,
        });
        Array(allSlidesCount).fill(1).forEach((_,index) => {
            if(index == 0){
                $('.mobile-hero-pagination').append('<span class="active"></span>');
                return;
            }
            $('.mobile-hero-pagination').append('<span></span>');
        });
        swiper.on('slideChange',function(swiper){
            $('.mobile-hero-pagination .active').removeClass('active');
            $('.mobile-hero-pagination span:nth-child('+(swiper.activeIndex+1)+')').addClass('active');

        })
    }
}

class Autocomplete{
    constructor(element,targetElement){
        this.element = element;
        this.targetElement = targetElement;
        this.initPosition();
        this.handleSearchInput();
    }
    handleSearchInput(){
        const self = this;
        const input = this.targetElement.querySelector('input');
        input.addEventListener('change', function(e){
            if(this.value.length){
                this.classList.add('active');
            }else{
                this.classList.remove('active');
            }
        });
        input.addEventListener('focus', function(e){
            self.element.classList.add('active');
            $('body').addClass('overflow-hidden');
            $('body').append('<div class="backdrop"></div>');
            self.targetElement.style.zIndex = '99';
        });
        input.addEventListener('blur', function(e){
            setTimeout(() => {
                self.element.classList.remove('active');
                $('.backdrop').remove();
                $('body').removeClass('overflow-hidden');
                self.targetElement.style.zIndex = 'initial';
            },50);
        });
    }
    initPosition(){
        this.element.style.width = (this.targetElement.getBoundingClientRect().width + 150) + 'px';
        this.element.style.right = window.innerWidth - (this.targetElement.getBoundingClientRect().left + this.targetElement.getBoundingClientRect().width) + 'px';
        this.element.style.top = (this.targetElement.getBoundingClientRect().top + this.targetElement.getBoundingClientRect().height + 24) + 'px';
    }
}

class App{
    constructor(){
        this.initNoUi();
        this.initNumberInputs();
        this.initPriceInputs();
        this.initCopyInputs();
        this.initAjaxSendComment();
        this.initDeselectableRadios();
        this.initElementTogglers();
        this.initAutocomplete();
        this.handleStories();

        App.initSelect2();
        this.initSteps();
        this.initEnglishDigitsInput();
        this.initNumberOnlyInput();
        this.initFileInputs();
        this.initSwipers();
        this.isMobile = window.innerWidth <= 1024;

        const isSingleProductPage = document.body.classList.contains('single-product-page');
        this.isBasketPage = document.body.classList.contains('basket-page');
        this.isOrderPage = document.body.classList.contains('order-page');
        this.isCategoryPage = document.body.classList.contains('category-page');

        if(this.isOrderPage){
            new OrderPage();
        }
        if(this.isCategoryPage){
            new ProductsPage();
        }
        if(isSingleProductPage){
            new SingleProductPage();
        }
        if(this.isBasketPage){
            new BasketPage();
        }
        if(this.isMobile){
            new Mobile();
        }
        new Address();
    }

    handleStories(){
        $('.story-circle').on('click',function(e){
            e.preventDefault();

            const type = $(this).data('type');
            const src = $(this).data('src');
            const href = $(this).attr('href');
            const element = type.includes('video') ? `<video controls controlsList="nodownload" style="max-height: 90vh" class ="h-100 w-100 object-cover object-center rounded-lg shadow-lg z-index-3">
                    <source src="${src}" type="video/mp4" >
                </video>` : `<img src="${src}" class="h-100 w-100 object-cover object-center rounded-lg shadow-lg z-index-3" />`;
            $('#storyModal .modal-body').html('');
            $('#storyModal .modal-body').append(element);
            $('#storyModal .modal-body').append(`<a href="${href}" target=\"\" class=\"btn btn-primary w-100\ mt-3 d-flex justify-content-center">مشاهده <i class=\"bi bi-chevron-left p-0\"></i></a>`);
            //$('#storyModal .modal-body a').attr('href', href);
            $("#storyModal").modal("show")
        });
    }
    initSwipers(){
        const allSwipers = document.querySelectorAll('[data-carousel]');
        allSwipers.forEach(element => {
            const slidesPerView = element.getAttribute('data-slides-per-view') ? (+element.getAttribute('data-slides-per-view')) : 5;
            const autoplay = element.getAttribute('data-autoplay') || false;
            const autoplayDelay = element.getAttribute('data-autoplay-delay') || 2500;
            const swiper = new Swiper(element,{
                loop: false,
                slidesPerView:window.innerWidth > 1024 ? slidesPerView : 'auto',
                freeMode: window.innerWidth < 1024 ? {
                    enabled:true,
                } : undefined,
                autoplay: autoplay ? {
                    delay: autoplayDelay,
                    disableOnInteraction: false,
                } : undefined,
                navigation: {
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                },
            });
        });
    }

    initAutocomplete(){
        const element = document.querySelector('.search-autocomplete');
        const targetElement = document.querySelector('.search-wrapper');
        const autocomplete = new Autocomplete(element,targetElement);
    }

    initFileInputs(){
        $('.file-input').each(function(){
            new FileInput(this);
        });
    }

    initElementTogglers(){
        $('[data-toggle]').each(function(){
            if($(this).data('toggle') == 'modal') return;
            $(this).on('click',function(e){
                e.preventDefault();
                const target = $(this).data('target');
                $(target).fadeToggle(200);
            });
        });
    }

    initNumberOnlyInput(){
        $('input[data-number-only]').each(function(){
            Util.numberInput(this);
        });
    }

    initEnglishDigitsInput(){
        $('input[data-digits]').each(function(){
            Util.englishDigitsInput(this);
        });
    }

    initSteps(){
        $(document).on('click','[data-toggle="step"]',function(e){
            e.preventDefault();
            const target = $(this).data('target');
            const currentStep = $(this).closest('[data-role="step"][data-active="true"]');
            currentStep.attr('data-active',false);
            $(target).attr('data-active',true);
        });
    }

    static initSelect2(){
        $('.select2-init').each(function(){
            $(this).select2();
        });
    }

    initCountBoxes(){
        const allCountBoxes = document.querySelectorAll('.count-wrapper');
        allCountBoxes.forEach(countBox => {
            if(this.isBasketPage){
                return;
            }else{
                new CountBox(countBox);
            }
        });
    }

    initDeselectableRadios(){
        $('input[type="radio"][data-deselectable]').on('mousedown', function(e){
            $(this).data('checked',this.checked);
        });
        $('input[type="radio"][data-deselectable]').on('click', function(e){
            if($(this).data('checked')){
                this.checked = false;
                $(this).trigger('change');
            }
        });
    }

    initAjaxSendComment(){
        $('[data-submit="comment"]').on('click', function () {
            const form = $(this).closest('[data-form="comment"]');
            const button = $(this);
            const commentMessage = $('[data-message="comment"]');
            const currentButtonText = $(this).text();
            const data   = form.serialize();
            $.ajax({
                url: URLS.submitComment,
                data: data,
                type: 'POST',
                success: function (data) {
                    button.text(currentButtonText);
                    button.removeClass('bg-green');
                    button.removeClass('text-green');
                    button.removeAttr('disabled');
                    commentMessage.html(data.meta.status.messages);
                    commentMessage.removeClass('d-none');
                    commentMessage.addClass('bg-green-light text-green');
                    form[0].reset();
                },
                beforeSend: function () {
                    button.html('درحال ارسال');
                    button.prop('disabled', 'true');
                },
                error: function (xhr, message, data) {
                    button.removeAttr("disabled");
                    button.text('ثبت نظر');
                    commentMessage.html('');
                    commentMessage.removeClass('d-none');
                    const errors = JSON.parse(xhr.responseText);
                    const e      = errors.meta.status.messages;
                    for (message in e) {
                        commentMessage.addClass('bg-red-light text-red');
                        commentMessage.append('' + e[message] + '<br/>');
                    }
                }
            }).done(function () {
                button.removeAttr("disabled");
            });
        });
    }

    initCopyInputs(){
        $('a[data-role="copy"]').on('click',function(e){
            e.preventDefault();
            const target = $(this).data('target');
            if(!navigator || !navigator.clipboard) alert('در مرورگر شما پشتیبانی نمی‌شود');
            navigator.clipboard.writeText($(target).val());
            const currentText = $(this).text();
            const self = this;
            $(this).text('کپی شد');
            $(this).removeClass('btn-primary').addClass('btn-light');
            setTimeout(() => {
                $(self).text(currentText);
                $(self).removeClass('btn-light').addClass('btn-primary');
            },1500);
        });
    }

    initNoUi(){
        const allRangeInputs = document.querySelectorAll('[data-range-input]');
        allRangeInputs.forEach(rangeInput => {
            const min = Number($(rangeInput).attr('data-min')) || 0;
            const max = Number($(rangeInput).attr('data-max')) || 0;

            noUiSlider.create(rangeInput,{
                start: [min, max],
                connect: true,
                step:1,
                range: {
                    'min': min,
                    'max': max
                }
            });
            rangeInput.noUiSlider.on('update',e => {
                const priceMin = $(rangeInput).parent().find('[data-price-min]').val(Util.numberWithCommas(Number(Util.removeNonNumber(e[0]))));
                const priceMax = $(rangeInput).parent().find('[data-price-max]').val(Util.numberWithCommas(Number(Util.removeNonNumber(e[1]))));
            });
        });
    }

    initNumberInputs(){
        $('input[data-number-input]').on('keydown', function (evt) {
            var theEvent = evt || window.event;

            if (theEvent.type === 'paste') {
                key = event.clipboardData.getData('text/plain');
            } else {
                var key = theEvent.keyCode || theEvent.which;
                key = String.fromCharCode(key);
            }
            var regex = /[0-9]|\./;
            if (!regex.test(key) && (theEvent.keyCode !== 8 || theEvent.which !== 8)) {
                theEvent.returnValue = false;
                if (theEvent.preventDefault) theEvent.preventDefault();
            }
        });
        $('input.price-input').on('keyup',function(evt){
            $(this).val(numberWithCommas(evt.target.value.replace(',','')));
        });

    }

    initPriceInputs(){
        const allPriceInputs = document.querySelectorAll('input[data-price-input]');
        allPriceInputs.forEach(priceInput => {
            $(priceInput).val(Util.numberWithCommas($(priceInput).val().replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')));
            const priceInputForm = $(priceInput).closest('form:not(#ticket-form)');
            if(!priceInputForm) return;
            priceInputForm.on('submit', function(e){
                const minValue = $(priceInput).data('min') || 0;
                const maxValue = $(priceInput).data('max') || 5000000;

                const realInput = $(priceInput).siblings('input[data-real-input]');
                if(!realInput) return;
                if($(realInput).val() > maxValue || $(realInput).val() < minValue){
                    e.preventDefault();
                    const priceUnit = document.querySelector('[data-price-unit]')?.innerHTML || '';
                    $(priceInputForm).find('[data-form-message]')?.text("مبلغ وارد شده باید بین " + Number(minValue).toLocaleString() + " و " + Number(maxValue).toLocaleString() + " " + priceUnit + " باشد.");
                    return false;
                }
            });
        });
        $('input[data-price-input]').on('input',function(){
            $(this).val(Util.numberWithCommas(Util.removeNonNumber($(this).val())));
            const newVal = $(this).val();
            const newValAsNumber = parseInt(newVal.replace(/\,/g,''));
            const realPriceInput = $(this).siblings('input[data-real-input]');
            realPriceInput.val(newValAsNumber)
        });
    }
}

jQuery(new App());
