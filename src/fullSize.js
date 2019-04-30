(function ($, window)
{
    var Target=null;            //fullSizeContainer
    var Sections = [];          //所有區塊
    var LockWheelTimer;         //鎖定滾輪時間戳
    var LastEffectY = 0;        //上一次的偏移值
    var DotContainer;           //點點Container
    var Dots = [];              //所有點點

    var Config={
        'LockWheel': true,      //是否暫時鎖定滾輪
        'LockWheelTime': 250,   //鎖定滾輪時間(需配合LockWheel)
        'DynamicSpeed': true,   //動畫是否會依照距離長度而改變(避免短距離太慢)
        'Dot': true,            //是否顯示點點
    };
    
    var methods = {

        //init
        init:function(CustomOptions)
        {
            Config = $.extend(Config, CustomOptions);

            Target=this;
            Sections=$(Target).find('.section');

            $(window).on('resize',function(){
                methods.reSize();
            });

            methods.reSize();

            $(Target).addClass('fullSize');
            $('body').addClass('fullSize-lock');

            $(window).on('mousewheel',function(e){
                console.log('wheel');
                // e.preventDefault();

                //wheel up
                if(e.originalEvent.wheelDelta > 0)
                {
                    methods.prev();
                }

                //wheel down
                else
                {
                    methods.next();
                }
                
            });

            /*window.addEventListener('mousewheel',function(e){
                // e.preventDefault();

                //wheel up
                if (e.wheelDelta > 0) {
                    methods.prev();
                }

                //wheel down
                else {
                    methods.next();
                }
            },
            {
                passive: true
            });*/
            
            //製造點點
            if (Config.Dot)
            {
                DotContainer = $('<div></div>').addClass('fullSize-dots');
                for (var i = 0; i < Sections.length; i++) {
                    var Dot = $('<div></div>').addClass('dot');
                    Dots.push(Dot);
                    DotContainer.append(Dot);
                }
                $('body').append(DotContainer);
            }

            var NextSection = $(Sections[0]);
            SetTranslate(NextSection, NextSection);
            
        },

        //update
        update:function(content)
        {

        },

        //reSize
        reSize:function(){

            console.log('resize');

            var WindowWidth=$(window).width();
            var WindowHeight=$(window).height();
            $(Sections).each(function(){

                if (!$(this).hasClass('fullSize-center') && 
                    !$(this).hasClass('fullSize-buttom') && 
                    !$(this).hasClass('fullSize-custom'))
                {
                    $(this).css({
                        width: WindowWidth,
                        height: WindowHeight,
                    });
                }

            });
            
            /*$(Target).css({
                'width': $(window).width(),
                'height': $(window).height(),
            });
            $(Target).find('.section').each(function () {
                $(this).css({
                    'width': $(window).width(),
                    'height': $(window).height(),
                })
            });*/
        },

        prev:function(){

            console.log('prev');

            var NowSection = $(Sections).filter('.active');
            var NextSection = NowSection.prev();

            SetTranslate(NowSection, NextSection);
        },
        next: function () {

            console.log('next');

            var NowSection = $(Sections).filter('.active');
            var NextSection = NowSection.next();

            SetTranslate(NowSection, NextSection);
        },
        to: function (TargetNumber) {

            console.log('to');

            var NowSection = $(Sections).filter('.active');
            var NextSection = $(Sections).eq(TargetNumber);

            SetTranslate(NowSection, NextSection);
        }
    };

    function SetTranslate(NowSection, NextSection)
    {
        //鎖定
        if (Config.LockWheel) {
            if ((new Date) - LockWheelTimer < Config.LockWheelTime) {
                return;
            }
        }

        //
        if (NextSection.length == 0) {
            return;
        }

        NowSection.removeClass('active');
        NextSection.addClass('active');

        //紀錄上方累積高度
        var EffectY=[];
        var Index = NextSection.index()+1;
        for(var i=0;i<Index;i++)
        {
            EffectY.push($(Sections).eq(i).height());
        }

        //目標對齊底部
        if (NextSection.hasClass('fullSize-buttom'))
        {
            var SelfY = EffectY.pop();
            EffectY.pop();
            EffectY.push(SelfY);
        }
        //目標對齊中央
        else if (NextSection.hasClass('fullSize-center'))
        {
            var SelfY = EffectY.pop();
            EffectY.push( ($(window).height() - SelfY)/-2 );
        }
        //目標對齊頂部
        else
        {
            EffectY.pop();
        }

        //統計上方累積高度
        var EffectYTotal=0;
        for (var i = 0; i < EffectY.length;i++)
        {
            EffectYTotal += EffectY[i];
        }

        //
        $(Target).css({
            'transform': 'translateY(' + (EffectYTotal*-1) + 'px)'
        });

        //點點
        if (Config.Dot)
        {
            Dots[NowSection.index()].removeClass('active');
            Dots[NextSection.index()].addClass('active');
        }

        //紀錄
        LastEffectY = EffectYTotal * -1;

        $(Target).removeClass('view-' + NowSection.index());
        $(Target).addClass('view-' + NextSection.index());


        //鎖定
        if (Config.LockWheel) {
            LockWheelTimer = new Date();
        }
    }

    $.fn.fullSize = function(methodOrOptions)
    {
        if(methods[methodOrOptions])
        {
            return methods[methodOrOptions].apply(this, Array.prototype.slice.call(arguments, 1));
        }
        
        else if(typeof methodOrOptions === 'object' || !methodOrOptions)
        {
            // Default to "init"
            return methods.init.apply(this, arguments);
        }
        
        else
        {
            $.error('Method ' + methodOrOptions + ' does not exist on jQuery.fullSize');
        }
    };


})(jQuery, window);