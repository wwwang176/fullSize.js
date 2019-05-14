(function ($, window)
{
    var Target=null;            //fullSizeContainer
    var Sections = [];          //所有區塊
    var LockWheelTimer;         //鎖定滾輪時間戳
    var LastEffectXY = 0;        //上一次的偏移值
    var DotContainer;           //點點Container
    var Dots = [];              //所有點點

    var Config={
        Horizontal: false,      //是否水平排列
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
            Sections=$(Target).find('>.section');
            console.log(Sections);

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

            if(Config.Horizontal)
            {
                $(Target).width(Sections.length*100+'%');

                $(Sections).each(function () {
                    $(this).css({'float':'left'});
                });
            }

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

                if(Config.Horizontal)
                {
                    $(this).css({
                        width: WindowWidth
                    });

                    if (!$(this).hasClass('fullSize-center') &&
                        !$(this).hasClass('fullSize-buttom') &&
                        !$(this).hasClass('fullSize-custom')) {
                            $(this).css({
                                height: WindowHeight
                            });
                        }
                }
                else
                {
                    $(this).css({
                        width: WindowWidth
                    });

                    if (!$(this).hasClass('fullSize-center') && 
                        !$(this).hasClass('fullSize-buttom') && 
                        !$(this).hasClass('fullSize-custom'))
                    {
                        $(this).css({
                            height: WindowHeight
                        });
                    }
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
        var EffectXY=[];
        var Index = NextSection.index()+1;
        for(var i=0;i<Index;i++)
        {
            EffectXY.push(
                Config.Horizontal ? $(Sections).eq(i).width() : $(Sections).eq(i).height()
            );
        }

        //目標對齊底部
        if (NextSection.hasClass('fullSize-buttom'))
        {
            var SelfY = EffectXY.pop();
            EffectXY.pop();
            EffectXY.push(SelfY);
        }
        //目標對齊中央
        else if (NextSection.hasClass('fullSize-center'))
        {
            var SelfY = EffectXY.pop();
            EffectXY.push(
                (
                    (Config.Horizontal ? $(window).width() : $(window).height()) - SelfY
                ) / -2 
            );
        }
        //目標對齊頂部
        else
        {
            EffectXY.pop();
        }

        //統計上方累積高度
        var EffectXYTotal=0;
        for (var i = 0; i < EffectXY.length;i++)
        {
            EffectXYTotal += EffectXY[i];
        }

        //
        $(Target).css({
            'transform': 'translate' + (Config.Horizontal?'X':'Y') + '(' + (EffectXYTotal*-1) + 'px)'
        });

        //點點
        if (Config.Dot)
        {
            Dots[NowSection.index()].removeClass('active');
            Dots[NextSection.index()].addClass('active');
        }

        //紀錄
        LastEffectXY = EffectXYTotal * -1;

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