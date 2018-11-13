import { EscapeHtmlPipe } from "./components/graphic/sanitize.pipe";
import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { GraphicComponent } from "./components/graphic/graphic.component";
import { HttpClientModule } from "@angular/common/http";
import { D3FiddlinComponent } from "./components/d3-fiddlin/d3-fiddlin.component";
import { D3FiddlinService } from "./components/d3-fiddlin/d3-fiddlin.service";

@NgModule({
  declarations: [
    AppComponent,
    GraphicComponent,
    EscapeHtmlPipe,
    D3FiddlinComponent
  ],
  imports: [BrowserModule, AppRoutingModule, HttpClientModule],
  providers: [HttpClientModule, D3FiddlinService],
  bootstrap: [AppComponent]
})
export class AppModule {}
