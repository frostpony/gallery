function load_screen(screen_name) {
    for (var screen of document.getElementsByClassName("screen")) {
        screen.classList.add("hidden");
    } 

    document.getElementsByClassName(screen_name + "-screen")[0].classList.remove("hidden");
}